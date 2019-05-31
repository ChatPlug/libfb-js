import hexdump from 'buffer-hexdump'
import { EventEmitter } from 'events'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { MessageType } from './messages/MessageTypes'
import { encodeConnectMessage } from './messages/Connect'
import { encodePing } from './messages/Ping'
import { decodePublish, encodePublish, PublishPacket } from './messages/Publish'
import { encodePublishAck } from './messages/PublishAck'
import { encodePublishRecorded } from './messages/PublishRecorded'
import { encodeSubscribeMessage } from './messages/Subscribe'
import { encodeUnsubscribe } from './messages/Unsubscribe'
import MqttConnection from './MqttConnection'
import MqttMessage from './MqttMessage'
import MqttPacket from './MqttPacket'
import { MqttMessageFlag } from './MqttTypes'
import debug from 'debug'
import RandomIntGenerator from '../RandomIntGenerator'
import { MessageOptions } from '..'

const debugLog = debug('fblib')

/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi extends EventEmitter {
  connection: MqttConnection
  lastMsgId: number = 1
  tokens: AuthTokens
  lastPingMilis: number = -1
  deviceId: DeviceId

  constructor () {
    super()
    this.connection = new MqttConnection()
  }

  sendSubscribe (msg: MqttMessage) {
    this.lastMsgId = this.lastMsgId + 1
    return this.connection.writeMessage(msg)
  }

  /**
   * Connects the MQTT socket and binds listeners for receiving messages.
   * @param tokens
   * @param deviceId
   */
  async connect (tokens: AuthTokens, deviceId: DeviceId) {
    this.tokens = tokens
    this.deviceId = deviceId
    await this.connection.connect()
    this.connection.on('packet', packet => this.parsePacket(packet))
    await this.sendConnectMessage()
    this.connection.on('close', () => this.reconnect())
  }

  async reconnect () {
    debugLog('reconnecting...')
    await this.connection.connect()
    await this.sendConnectMessage()
    this.connection.emit('reconnect')
  }

  sendPing = () => {
    if (this.lastPingMilis < 0 || (this.lastPingMilis) < (60 * 1000) + new Date().getTime()) {
      return this.connection.writeMessage(encodePing())
    } else {
      // Attempt to reconnect
      return this.reconnect()
    }
  }

  /**
   * Sends a CONNECT mqtt message
   */
  async sendConnectMessage () {
    setInterval(this.sendPing, 60 * 1000)
    debugLog('sending connect message')
    if (!this.connection._connected) throw new Error('MQTT could not connect')
    const connectMessage = await encodeConnectMessage(this.tokens, this.deviceId)

    await this.connection.writeMessage(connectMessage)
    await this.waitForAck('Connect')

    await this.sendPublish(
      '/foreground_state',
      '{"foreground":true,"keepalive_timeout":60}'
    )

    await this.sendSubscribe(encodeSubscribeMessage(this.lastMsgId))
    await this.waitForAck('Subscribe')

    await this.sendSubscribe(encodeUnsubscribe(this.lastMsgId))
    await this.waitForAck('Unsubscribe')

    debugLog('Connected.')
    this.emit('connected')
  }

  async sendPublish (topic: string, data: Buffer | string) {
    let dataBuffer: Buffer
    if (data instanceof Buffer) {
      dataBuffer = data
    } else {
      dataBuffer = Buffer.from(data)
    }

    const packet = encodePublish({
      msgId: this.lastMsgId,
      topic,
      data: dataBuffer
    })
    this.lastMsgId += 1
    await this.connection.writeMessage(packet)
    await this.waitForAck('Publish')
  }

  async waitForAck (type: string) {
    return new Promise((resolve, reject) => {
      function onFailed () { reject(new Error('MQTT connection failed')) }
      this.connection.once('failed', onFailed)
      this.once(type + 'Ack', () => {
        this.connection.removeListener('failed', onFailed)
        resolve()
      })
    })
  }

  /**
   * Sends a facebook messenger message to someone.
   */
  sendMessage (threadId: string, message: string, options?: MessageOptions): Promise<{ succeeded: boolean, errStr?: string }> {
    return new Promise(async (resolve, reject) => {
      const milliseconds = Math.floor(new Date().getTime() / 1000)
      const rand = RandomIntGenerator.generate()
      const msgid = Math.abs((rand & 0x3fffff) | (milliseconds << 22))
      const msg: any = {
        body: message,
        msgid,
        sender_fbid: this.tokens.uid,
        to: (threadId.startsWith('100') || threadId.length < 16) ? threadId : `tfbid_${threadId}`
      }
      if (options && options.mentions && options.mentions.length) {
        msg.generic_metadata = {
          prng: JSON.stringify(options.mentions.map(mention => ({
            o: mention.offset,
            l: mention.length,
            i: mention.id,
            t: 'p'
          })))
        }
      }
      this.once('sentMessage:' + msgid.toString(), resolve)
      await this.sendPublish('/send_message2', JSON.stringify(msg))
    })
  }

  async sendPublishConfirmation (flags: number, publish: PublishPacket) {
    if (publish.msgId === 0) return

    const qos1 = (flags & MqttMessageFlag.QoS1) === MqttMessageFlag.QoS1
    const qos2 = (flags & MqttMessageFlag.QoS2) === MqttMessageFlag.QoS2
    let message: MqttMessage
    if (qos1) {
      message = encodePublishAck(publish.msgId)
    }

    if (qos2) {
      message = encodePublishRecorded(publish.msgId)
    }

    return this.connection.writeMessage(message)
  }

  async parsePacket (packet: MqttPacket) {
    switch (packet.type) {
      case MessageType.ConnectAck:
        debugLog('Packet type: ConnectAck')
        this.emit('ConnectAck')
        break
      case MessageType.Publish:
        debugLog('Packet type: Publish')
        const publish = decodePublish(packet)
        this.emit('publish', publish)
        await this.sendPublishConfirmation(packet.flag, publish)
        break
      case MessageType.SubscribeAck:
        debugLog('Packet type: SubscribeAck')
        this.emit('SubscribeAck')
        break
      case MessageType.PublishAck:
        debugLog('Packet type: PublishAck')
        this.emit('PublishAck')
        break
      case MessageType.UnsubscribeAck:
        debugLog('Packet type: UnsubscribeAck')
        this.emit('UnsubscribeAck')
        break
      case MessageType.Pong:
        debugLog('Packet type: Pong')
        this.lastPingMilis = new Date().getTime()
        break
      default:
        debugLog('Packet type:', packet.type)
        debugLog(hexdump(packet.content))
    }
  }
}
