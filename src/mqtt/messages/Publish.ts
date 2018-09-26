import zlib from "zlib"
import MqttMessage from "../MqttMessage"
import MqttPacket from "../MqttPacket"
import { MqttMessageFlag } from "../MqttTypes"
import PacketReader from "../PacketReader"
import { FacebookMessageType } from "./MessageTypes"

/**
 * Assembles a mqtt publish message.
 */
export const encodePublish = (msgId, topic, content): MqttMessage => {
    const message = new MqttMessage()
    message.writeString(topic)
    message.writeU16(msgId)
    message.writeRaw(zlib.deflateSync(Buffer.from(content)))
    message.flags = 2
    message.type = FacebookMessageType.Publish
    return message
}

export const decodePublish = (
    mqttPacket: MqttPacket
): { msgId; topic; content } => {
    const reader = new PacketReader(mqttPacket)
    const result = {} as { topic: string; msgId: number; content: any }
    result.topic = reader.readData().toString("utf8")

    result.msgId = 0
    if (
        mqttPacket.flag & MqttMessageFlag.QoS1 ||
        mqttPacket.flag & MqttMessageFlag.QoS2
    ) {
        result.msgId = reader.readU16()
    }

    result.content = zlib.inflateSync(reader.readRaw())

    return result
}
