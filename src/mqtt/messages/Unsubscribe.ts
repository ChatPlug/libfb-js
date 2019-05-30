import MqttMessage from '../MqttMessage'
import { MqttMessageFlag } from '../MqttTypes'
import { MessageType } from './MessageTypes'

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodeUnsubscribe = (msgId: number): MqttMessage => {
  return new MqttMessage(MessageType.Unsubscribe)
    .setFlags(MqttMessageFlag.Dup)
    .writeU16(msgId)
    .writeString('/orca_message_notifications')
}
