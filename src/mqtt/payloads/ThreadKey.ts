import Payload from './Payload'
import { Thrift, TCompactProtocol } from 'thrift'

export default class ThreadKeyPayload extends Payload {
  threadId: string
  threadType: number    // 0: CANONICAL, 1: GROUP

  constructor (threadId: string, threadType: 0 | 1) {
    super()
    this.threadId = threadId.toString()
    this.threadType = threadType
  }

  encode (proto: TCompactProtocol): Promise<void> {

    proto.writeFieldBegin('threadId', Thrift.Type.STRING, 1)
    proto.writeString(this.threadId)

    proto.writeFieldBegin('threadType', Thrift.Type.I32, 2)
    proto.writeI64(this.threadType)

    // denotes end of object
    proto.writeByte(0)

    return null
  }

  getTopic (): string {
    return null
  }
}
