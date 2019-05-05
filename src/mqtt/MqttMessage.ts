import { FacebookMessageType } from './messages/MessageTypes'

/**
 * Represents an outgoing message. This class allows to buffer different kinds of binary data so that messages can be assembled.
 */
export default class MqttMessage {
  toSend: Buffer
  type: FacebookMessageType
  flags: number

  constructor () {
    this.toSend = Buffer.alloc(0)
  }

  writeU16 (data: number) {
    const newBuf = Buffer.alloc(2)
    newBuf.writeUInt16BE(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
  }

  writeU32 (data: number) {
    const newBuf = Buffer.alloc(4)
    newBuf.writeUInt32BE(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
  }

  writeU8 (data: number) {
    const newBuf = Buffer.alloc(1)
    newBuf.writeUInt8(data, 0)
    this.toSend = Buffer.concat([this.toSend, newBuf])
  }

  writeString (strToAdd: string) {
    this.writeU16(strToAdd.length)
    const newBuf = Buffer.from(strToAdd, 'utf8')
    this.toSend = Buffer.concat([this.toSend, newBuf])
  }

  writeRawString (strToAdd: string) {
    const newBuf = Buffer.from(strToAdd, 'utf8')
    this.toSend = Buffer.concat([this.toSend, newBuf])
  }
  writeRaw (raw: Buffer) {
    this.toSend = Buffer.concat([this.toSend, raw])
  }
}
