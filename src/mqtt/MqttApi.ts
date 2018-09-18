import MqttConnection from "./MqttConnection"
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'
import { encodeSubscribeMessage } from './messages/Subscribe'

import MqttMessage from './MqttMessage'

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
      console.log(packet.type)
      switch (packet.type) {
        case FacebookMessageType.ConnectAck: 
          console.log("got connect ack")
          await this.sendSubscribe(encodeSubscribeMessage(this.lastMsgId))
          break;
        case FacebookMessageType.SubscribeAck: 
          console.log("got subscribe ack")
          break;
        case FacebookMessageType.Publish:
        
          break;
      }
    })

    const connectMessage = await encodeConnectMessage(tokens, deviceId)
    await this.connection.writeMessage(connectMessage)
  }
}
