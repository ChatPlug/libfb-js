import Message from './Message'
import { TTransport, TCompactProtocol, Thrift, TBufferedTransport } from 'thrift'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'
import MqttMessage from '../MqttMessage';
import { MqttConnectFlag } from '../MqttTypes'
import { FacebookMessageType } from './MessageTypes';

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodeSubscribeMessage = (msgId): MqttMessage => {
    const topics = ["/inbox", "/mercury", "/messaging_events", "/orca_presence", "/orca_typing_notifications",
    "/pp", "/t_ms", "/t_p", "/t_rtc", "/webrtc", "/webrtc_response"]
    const message = new MqttMessage()

    message.writeU16(msgId)
    for (const topic in topics) {
        message.writeString(topic)
        message.writeU8(0)
    }
    message.flags = MqttConnectFlag.QoS1
    message.type = FacebookMessageType.Subscribe
    return (message)
}

