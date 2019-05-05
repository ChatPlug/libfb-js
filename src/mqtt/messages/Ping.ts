import MqttMessage from '../MqttMessage'
import { FacebookMessageType } from '../MqttPacket'

/**
 * Assembles a ping message.
 */
export const encodePing = (): MqttMessage => {
  const message = new MqttMessage()
  message.flags = 0
  message.type = FacebookMessageType.Ping
  return message
}
