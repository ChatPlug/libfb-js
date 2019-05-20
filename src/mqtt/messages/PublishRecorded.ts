import MqttMessage from '../MqttMessage'
import { MqttMessageFlag } from '../MqttTypes'
import { MessageType } from './MessageTypes'

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodePublishRecorded = (msgId: number): MqttMessage => {
  return new MqttMessage(MessageType.PublishRecorded)
    .setFlags(MqttMessageFlag.QoS0)
    .writeU16(msgId)
}
