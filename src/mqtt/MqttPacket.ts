import { MqttMessageFlag } from './MqttTypes'
export type MqttHeader = { size, i }

export enum FacebookMessageType {
    Connect = 1,
    ConnectAck = 2,
    Publish = 3,
    PublishAck = 4,
    PublishRecorded = 5,
    PublishReleased = 6,
    PubComp = 7,
    Subscribe = 8,
    SubscribeAck = 9,
    Unsubscribe = 10,
    UnsubscribeAck = 11,
    Ping = 12,
    Pong = 13,
    Disconnect = 14
}

export default interface MqttPacket {
  header: MqttHeader,
  type: FacebookMessageType,
  content: Buffer,
  flag: MqttMessageFlag
}