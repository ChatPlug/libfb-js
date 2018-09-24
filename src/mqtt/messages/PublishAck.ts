import Message from "./Message"
import {
    TTransport,
    TCompactProtocol,
    Thrift,
    TBufferedTransport
} from "thrift"
import AuthTokens from "../../types/AuthTokens"
import DeviceId from "../../types/DeviceId"
import MqttMessage from "../MqttMessage"
import { MqttConnectFlag } from "../MqttTypes"
import { FacebookMessageType } from "./MessageTypes"

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodePublishAck = (msgId): MqttMessage => {
    const message = new MqttMessage()

    message.writeU16(msgId)
    message.flags = MqttConnectFlag.QoS0
    message.type = FacebookMessageType.PublishAck
    return message
}
