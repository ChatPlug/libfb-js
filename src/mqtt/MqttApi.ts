import MqttConnection from "./MqttConnection"
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'

/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi {
  connection: MqttConnection;
  _connected = false

  constructor() {
    this.connection = new MqttConnection()

    this.connection.emitter.on("packet", (packet: MqttPacket) => {
      switch (packet.type) {
        case FacebookMessageType.ConnectAck: 
          console.log("got connect ack")
          break
      }
    })
  }

  async connect() {
    await this.connection.connect()
    this._connected = true
  }

  async sendConnectMessage(tokens: AuthTokens, deviceId: DeviceId) {
    if (!this._connected) {
      return
    }

    const connectMessage = await encodeConnectMessage(tokens, deviceId)
    this.connection.writeMessage(connectMessage)
  }
}
