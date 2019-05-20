import { MqttMessageFlag } from './MqttTypes'
import { MessageType } from './messages/MessageTypes'

export interface MqttHeader {
  size: number
  i: number
}

export default interface MqttPacket {
  header: MqttHeader
  type: MessageType
  content: Buffer
  flag: MqttMessageFlag
}
