import MqttMessage from "../MqttMessage"
import { MqttConnectFlag } from "../MqttTypes"
import { FacebookMessageType } from "./MessageTypes"

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodeSubscribeMessage = (msgId): MqttMessage => {
    const topics = [
        "/inbox",
        "/messaging_events",
        "/t_ms",
        "/t_rtc",
        "/webrtc",
        "/webrtc_response"
    ]
    const message = new MqttMessage()

    message.writeU16(msgId)
    for (const topic of topics) {
        message.writeString(topic)
        message.writeU8(0)
    }
    message.flags = MqttConnectFlag.QoS1
    message.type = FacebookMessageType.Subscribe
    return message
}
