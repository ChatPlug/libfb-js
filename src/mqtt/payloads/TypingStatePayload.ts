import Payload from './Payload'
import ThreadKey from './ThreadKey'
import { Thrift, TCompactProtocol, Int64 } from 'thrift'
import Long from 'long'

export default class TypingStatePayload extends Payload {
  recipient: string
  sender: string
  state: boolean
  threadKey: ThreadKey

  constructor (senderUserId: string, state: boolean, recipientUserOrThreadId: string) {
    super()

    this.sender = senderUserId.toString()
    this.state = state

    if (recipientUserOrThreadId.toString().startsWith('100')) {
      this.recipient = recipientUserOrThreadId.toString()
    } else {
      this.threadKey = new ThreadKey(recipientUserOrThreadId.toString(), 1)
    }
  }

  encode (proto: TCompactProtocol): Promise<void> {
    // Added explicitly outside of thrift code
    proto.writeByte(0)

    if (this.recipient != null) {
      proto.writeFieldBegin('recipient', Thrift.Type.I64, 1)
      proto.writeI64(new Int64(Buffer.from(Long.fromString(this.recipient).toBytes())))
    }

    proto.writeFieldBegin('sender', Thrift.Type.I64, 2)
    proto.writeI64(new Int64(Buffer.from(Long.fromString(this.sender).toBytes())))

    proto.writeFieldBegin('state', Thrift.Type.I32, 3)
    proto.writeI32(this.state ? 1 : 0)

    if (this.threadKey != null) {
      proto.writeFieldBegin('threadKey', Thrift.Type.STRUCT, 5)
      proto.writeStructBegin('threadKey')
      this.threadKey.encode(proto)
      proto.writeStructEnd()
      proto.writeFieldEnd()
    }

    // denotes end of object
    proto.writeByte(0)

    return null
  }

  getTopic (): string {
    return '/t_st'
  }
}
