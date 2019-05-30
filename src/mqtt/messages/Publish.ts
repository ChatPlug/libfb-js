import zlib from 'zlib'
import MqttMessage from '../MqttMessage'
import MqttPacket from '../MqttPacket'
import { MqttMessageFlag } from '../MqttTypes'
import PacketReader from '../PacketReader'
import { MessageType } from './MessageTypes'

export interface PublishPacket {
  msgId: number
  topic: string
  data: Buffer
}

/**
 * Assembles a mqtt publish message.
 */
export const encodePublish = (packet: PublishPacket): MqttMessage => {
  return new MqttMessage(MessageType.Publish)
    .setFlags(MqttMessageFlag.QoS1)
    .writeString(packet.topic)
    .writeU16(packet.msgId)
    .writeRaw(zlib.deflateSync(packet.data))
}

export const decodePublish = (mqttPacket: MqttPacket): PublishPacket => {
  const reader = new PacketReader(mqttPacket)
  const result = {} as PublishPacket
  result.topic = reader.readData().toString('utf8')

  result.msgId = 0
  if (
        mqttPacket.flag & MqttMessageFlag.QoS1 ||
        mqttPacket.flag & MqttMessageFlag.QoS2
    ) {
    result.msgId = reader.readU16()
  }

  result.data = zlib.inflateSync(reader.readRaw())

  return result
}
