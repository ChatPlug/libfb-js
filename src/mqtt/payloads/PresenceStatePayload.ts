import Payload from './Payload'
import { Thrift, TCompactProtocol, Int64 } from 'thrift'
import Long from 'long'

export default class PresenceStatePayload extends Payload {
  recipient: string
  sender: number // Number because always 0
  state: boolean

  constructor (recipientId: string, state: boolean) {
    super()
    this.recipient = recipientId.toString()
    this.sender = 0
    this.state = state
  }

  encode (proto: TCompactProtocol): Promise<void> {
    /////////////////////
    // Tracking info
    /////////////////////

    proto.writeFieldBegin('traceInfo', Thrift.Type.STRING, 1)
    proto.writeString('')  // Empty string in our case

    // Note lack of end-of-object null

    /////////////////////
    // Typing presence
    /////////////////////

    proto.writeFieldBegin('recipient', Thrift.Type.I64, 1)
    proto.writeI64(new Int64(Buffer.from(Long.fromString(this.recipient).toBytes())))

         // sender always 0
    proto.writeFieldBegin('sender', Thrift.Type.I64, 2)
    proto.writeI64(this.sender)

    proto.writeFieldBegin('state', Thrift.Type.I32, 3)
    proto.writeI32(this.state ? 1 : 0)

    // denotes end of object
    proto.writeByte(0)

    return null
  }

  getTopic (): string {
    return '/t_stp'
  }
}
