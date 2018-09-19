import MqttConnection from "./MqttConnection"
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'
import { encodeSubscribeMessage } from './messages/Subscribe'
import { decodePublish, encodePublish } from './messages/Publish'
import { encodePublishRecorded } from './messages/PublishRecorded'
import { encodePublishAck } from './messages/PublishAck'
import dump from 'hexdump-nodejs'
import MqttMessage from './MqttMessage'
import { MqttMessageFlag } from './MqttTypes';
import { encodeUnsubscribe } from './messages/Unsubscribe';
import { encodePing } from './messages/Ping';
import { EventEmitter } from 'events';

class MqttApiEmitter extends EventEmitter {}
/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi {
  connection: MqttConnection;
  _connected = false
  lastMsgId: number = 1
  emitter = new MqttApiEmitter()

  constructor() {
    this.connection = new MqttConnection()
  }

  on(event, cb) {
    this.emitter.on(event, cb)
  }

  async sendSubscribe(msg: MqttMessage) {
    this.lastMsgId = this.lastMsgId + 1
    this.connection.writeMessage(msg)
  }

  async connect() {
    await this.connection.connect()
    this._connected = true
  }

  sendPing = async () => {
    await this.connection.writeMessage(encodePing())
    setTimeout(this.sendPing, 60 * 1000)
  }

  async sendConnectMessage(tokens: AuthTokens, deviceId: DeviceId) {
    setTimeout(this.sendPing, 60 * 1000)
    if (!this._connected) {
      return
    }
    this.connection.emitter.on("packet", async (packet: MqttPacket) => {
      
      switch (packet.type) {
        case FacebookMessageType.ConnectAck: 
          console.log("got connect ack")
          await this.sendPublish("/foreground_state", '{"foreground":true,"keepalive_timeout":60}')
          await this.sendSubscribe(encodeSubscribeMessage(this.lastMsgId))
          await this.sendSubscribe(encodeUnsubscribe(this.lastMsgId))
          console.log("it worked.")

          // await this.sendMessage()
          this.emitter.emit("connected")
          break;
        case FacebookMessageType.SubscribeAck: 
          console.log("got subscribe ack")
          break;
        case FacebookMessageType.Publish:
          const publish = decodePublish(packet)
          // console.log(publish)
          console.log(publish.topic)
          this.emitter.emit("publish", publish)
          this.sendPublishConfirmation(packet.flag, publish)
          break;
        default:
          console.log("unknown packet")
      }
    })

    const connectMessage = await encodeConnectMessage(tokens, deviceId)
    await this.connection.writeMessage(connectMessage)
  }

  async sendPublish(topic: string, data: string) {
    const packet = encodePublish(this.lastMsgId, topic, data)
    this.lastMsgId += 1
    this.connection.writeMessage(packet)
  }

  async sendMessage() {
    const milliseconds = Math.floor((new Date).getTime()/1000)
    const rand = this.getRandomInt(0, 2^32-1)
    const msgId = ((rand & 0x3FFFFF) | (milliseconds << 22))
    const msg = {
      body: "Ddd",
      msgid: msgId,
      sender_fbid: 100009519229821,
      to: 100002974638116
    }
    setTimeout(() => 
    this.sendPublish("/send_message2", JSON.stringify(msg)), 5000)
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async sendPublishConfirmation(flags: number, publish) {
    if (publish.msgId === 0) {
      return
    }

    const qos1 = (flags & MqttMessageFlag.QoS1) == MqttMessageFlag.QoS1
    const qos2 = (flags & MqttMessageFlag.QoS1) == MqttMessageFlag.QoS1
    if (qos1) {
      this.connection.writeMessage(encodePublishAck(publish.msgId))
    }

    if (qos2) {
      this.connection.writeMessage(encodePublishRecorded(publish.msgId))
    }
  }
}
