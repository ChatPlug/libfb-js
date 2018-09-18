import MqttConnection from "./MqttConnection"
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'
import { encodeSubscribeMessage } from './messages/Subscribe'
import { decodePublish, encodePublish } from './messages/Publish'
import { encodePublishRecorded } from './messages/PublishRecorded'
import { encodePublishAck } from './messages/PublishAck'

import MqttMessage from './MqttMessage'
import { MqttMessageFlag } from './MqttTypes';
import { encodeUnsubscribe } from './messages/Unsubscribe';

/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi {
  connection: MqttConnection;
  _connected = false
  lastMsgId: number = 1

  constructor() {
    this.connection = new MqttConnection()
  }

  async sendSubscribe(msg: MqttMessage) {
    this.lastMsgId = this.lastMsgId + 1
    this.connection.writeMessage(msg)
  }

  async connect() {
    await this.connection.connect()
    this._connected = true
  }

  async sendConnectMessage(tokens: AuthTokens, deviceId: DeviceId) {
    if (!this._connected) {
      return
    }
    this.connection.emitter.on("packet", async (packet: MqttPacket) => {
      console.dir(packet)
      
      switch (packet.type) {
        case FacebookMessageType.ConnectAck: 
          console.log("got connect ack")
          await this.sendPublish("/foreground_state", '"{\\"foreground\\":true,\\"keepalive_timeout\\":60}"')
          await this.sendSubscribe(encodeSubscribeMessage(this.lastMsgId))
          await this.sendSubscribe(encodeUnsubscribe(this.lastMsgId))
          console.log("it worked.")
          break;
        case FacebookMessageType.SubscribeAck: 
          console.log("got subscribe ack")
          break;
        case FacebookMessageType.Publish:
          const publish = decodePublish(packet)

          break;
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
