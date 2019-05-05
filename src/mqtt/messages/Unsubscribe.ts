import MqttMessage from '../MqttMessage'
import { MqttConnectFlag } from '../MqttTypes'
import { FacebookMessageType } from './MessageTypes'

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodeUnsubscribe = (msgId): MqttMessage => {
  const message = new MqttMessage()

  message.writeU16(msgId)
  message.writeString('/orca_message_notifications')

  message.flags = MqttConnectFlag.QoS1
  message.type = FacebookMessageType.Unsubscribe
  return message
}
