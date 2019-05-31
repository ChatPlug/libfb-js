import Payload from './Payload'
import { Thrift, TCompactProtocol, Int64 } from 'thrift'
import Message from '../../types/Message'
import RandomIntGenerator from '../../RandomIntGenerator'
import Long from 'long'

export default class ReadReceiptPayload extends Payload {

  otherUserFbId: string     // Used for individuals
  threadFbId: string        // Used for groups, same as threadId ( usually ? )
  watermarkTimestamp: number// Must match timestamp of a message

  public constructor (message: Message) {
    super()

    if (message.authorId.toString() === message.threadId.toString()) {
      // If author id equals thread id, then this is not a group convo
      this.otherUserFbId = message.authorId.toString()
    } else {
      // Otherwise it is
      this.threadFbId = message.threadId.toString()
    }

    this.watermarkTimestamp = message.timestamp

  }

  encode (proto: TCompactProtocol): Promise<void> {
    /////////////////////
    // thrift header?
    /////////////////////

    // Always completely empty.
    proto.writeByte(0)

    // Note lack of end-of-object null

    /////////////////////
    // Typing presence
    /////////////////////

    proto.writeFieldBegin('mark', Thrift.Type.STRING, 1)
    proto.writeString('read')

    proto.writeFieldBegin('state', Thrift.Type.BOOL, 2)
    proto.writeBool(true)

    if (this.threadFbId != null) {
      proto.writeFieldBegin('threadFbId', Thrift.Type.I64, 6)
      proto.writeI64(new Int64(Buffer.from(Long.fromString(this.threadFbId).toBytes())))
    } else if (this.otherUserFbId != null) {
      proto.writeFieldBegin('otherUserFbId', Thrift.Type.I64, 7)
      proto.writeI64(new Int64(Buffer.from(Long.fromString(this.otherUserFbId).toBytes())))
    } else {
        // Throw?
    }

    proto.writeFieldBegin('watermarkTimestamp', Thrift.Type.I64, 9)
    proto.writeI64(this.watermarkTimestamp)

    proto.writeFieldBegin('attemptId', Thrift.Type.I64, 13)
    proto.writeI64(new Int64(Buffer.from(RandomIntGenerator.getAttemptId().toBytes())))

    // denotes end of object
    proto.writeByte(0)

    return null
  }

  getTopic (): string {
    return '/t_mt_req'
  }
}
