import { MessageType } from './messages/MessageTypes'

/**
 * Represents an outgoing message. This class allows to buffer different kinds of binary data so that messages can be assembled.
 */
export default class MqttMessage {
  toSend: Buffer
  type: MessageType
  flags: number

  constructor (type?: MessageType) {
    this.toSend = Buffer.alloc(0)
    if (type) this.type = type
  }

  setFlags (flags: number) {
    this.flags = flags
    return this
  }

  writeU16 (data: number) {
    const newBuf = Buffer.alloc(2)
    newBuf.writeUInt16BE(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
    return this
  }

  writeU32 (data: number) {
    const newBuf = Buffer.alloc(4)
    newBuf.writeUInt32BE(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
    return this
  }

  writeU8 (data: number) {
    const newBuf = Buffer.alloc(1)
    newBuf.writeUInt8(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
    return this
  }

  writeString (strToAdd: string) {
    this.writeU16(strToAdd.length)
    const newBuf = Buffer.from(strToAdd, 'utf8')
    this.toSend = Buffer.concat([this.toSend, newBuf])
    return this
  }

  writeRawString (strToAdd: string) {
    const newBuf = Buffer.from(strToAdd, 'utf8')
    this.toSend = Buffer.concat([this.toSend, newBuf])
    return this
  }

  writeRaw (raw: Buffer) {
    this.toSend = Buffer.concat([this.toSend, raw])
    return this
  }
}
