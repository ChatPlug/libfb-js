import Message from './Message'
import { TTransport, TCompactProtocol, Thrift, TBufferedTransport } from 'thrift'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'
import MqttMessage from '../MqttMessage';
import { MqttConnectFlag } from '../MqttTypes'
import { FacebookMessageType } from './MessageTypes';
import zlib from 'zlib'

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodePublish = (msgId, topic, content): MqttMessage => {
    const message = new MqttMessage()

    message.writeString(topic)
    message.writeU16(msgId)
    message.writeRaw(zlib.deflateSync(content))
    message.flags = MqttConnectFlag.QoS1
    message.type = FacebookMessageType.Publish
    return (message)
}

