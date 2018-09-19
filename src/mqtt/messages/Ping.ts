import MqttMessage from '../MqttMessage';
import { FacebookMessageType } from '../MqttPacket';

/**
 * Assembles a subscribe message sent just after mqtt connection that subscribes to given topics.
 */
export const encodePing = (): MqttMessage => {
    const message = new MqttMessage()
    message.flags = 0
    message.type = FacebookMessageType.Ping
    return (message)
}