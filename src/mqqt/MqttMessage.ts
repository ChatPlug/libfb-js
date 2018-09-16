export default class MqttMessage {
    toSend: Buffer
    constructor() {
        this.toSend = new Buffer(0)
    }

    writeU16(data: number) {
        const newBuf = Buffer.alloc(2)
        newBuf.writeUInt16BE(data, 0)
        this.toSend = Buffer.concat([this.toSend, newBuf])
    }

    writeU32(data: number) {
        const newBuf = Buffer.alloc(4)
        newBuf.writeUInt32BE(data, 0)
        this.toSend = Buffer.concat([this.toSend, newBuf])
    }

    writeString(strToAdd: string) {
        this.writeU16(strToAdd.length)
        const newBuf = Buffer.from(strToAdd, 'utf8')
        this.toSend = Buffer.concat([this.toSend, newBuf])
    }
}