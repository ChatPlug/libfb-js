import hexdump from 'buffer-hexdump'
import { EventEmitter } from 'events'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'
import { encodePing } from './messages/Ping'
import { decodePublish, encodePublish, PublishPacket } from './messages/Publish'
import { encodePublishAck } from './messages/PublishAck'
import { encodePublishRecorded } from './messages/PublishRecorded'
import { encodeSubscribeMessage } from './messages/Subscribe'
import { encodeUnsubscribe } from './messages/Unsubscribe'
import MqttConnection from './MqttConnection'
import MqttMessage from './MqttMessage'
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import { MqttMessageFlag } from './MqttTypes'
import debug from 'debug'
import RandomIntGenerator from '../RandomIntGenerator'

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
    this.connection.on('packet', this.parsePacket)
    await this.sendConnectMessage()
    this.connection.on('close', () => this.reconnect())
  }

  reconnect = async () => {
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

  async sendPublish (topic: string, data: string) {
    const packet = encodePublish({
      msgId: this.lastMsgId,
      topic,
      data: Buffer.from(data)
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
  sendMessage (threadId: string, message: string): Promise<{ succeeded: boolean, errStr?: string }> {
    return new Promise(async (resolve, reject) => {
      const milliseconds = Math.floor(new Date().getTime() / 1000)
      const rand = RandomIntGenerator.generate()
      const msgid = Math.abs((rand & 0x3fffff) | (milliseconds << 22))
      const msg = {
        body: message,
        msgid,
        sender_fbid: this.tokens.uid,
        to: threadId
      }
      this.once('sentMessage:' + msgid, resolve)
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

  parsePacket = async (packet: MqttPacket) => {
    switch (packet.type) {
      case FacebookMessageType.ConnectAck:
        debugLog('Packet type: ConnectAck')
        this.emit('ConnectAck')
        break
      case FacebookMessageType.Publish:
        debugLog('Packet type: Publish')
        const publish = decodePublish(packet)
        this.emit('publish', publish)
        await this.sendPublishConfirmation(packet.flag, publish)
        break
      case FacebookMessageType.SubscribeAck:
        debugLog('Packet type: SubscribeAck')
        this.emit('SubscribeAck')
        break
      case FacebookMessageType.PublishAck:
        debugLog('Packet type: PublishAck')
        this.emit('PublishAck')
        break
      case FacebookMessageType.UnsubscribeAck:
        debugLog('Packet type: UnsubscribeAck')
        this.emit('UnsubscribeAck')
        break
      case FacebookMessageType.Pong:
        debugLog('Packet type: Pong')
        this.lastPingMilis = new Date().getTime()
        break
      default:
        debugLog('Packet type:', packet.type)
        debugLog(hexdump(packet.content))
    }
  }
}
