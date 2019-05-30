import MqttMessage from '../MqttMessage'
import { MessageType } from './MessageTypes'
import { MqttMessageFlag } from '../MqttTypes'

/**
 * Assembles a ping message.
 */
export const encodePing = (): MqttMessage => {
  return new MqttMessage(MessageType.Ping)
    .setFlags(MqttMessageFlag.QoS0)
}
