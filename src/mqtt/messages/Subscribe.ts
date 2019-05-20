import MqttMessage from '../MqttMessage'
import { MqttMessageFlag } from '../MqttTypes'
import { MessageType } from './MessageTypes'

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodeSubscribeMessage = (msgId): MqttMessage => {
  const topics = [
    '/inbox',
    '/messaging_events',
    '/t_ms',
    '/t_rtc',
    '/webrtc',
    '/webrtc_response'
  ]
  const message = new MqttMessage(MessageType.Subscribe)
    .setFlags(MqttMessageFlag.Dup)
    .writeU16(msgId)

  for (const topic of topics) {
    message
      .writeString(topic)
      .writeU8(0)
  }
  return message
}
