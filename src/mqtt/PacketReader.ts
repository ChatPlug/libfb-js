import MqttPacket from './MqttPacket'

export default class PacketReader {
    packet: MqttPacket
    pos: number = 0
    constructor(packet: MqttPacket) {
        this.packet = packet   
    }

    readU8(): number {
        const res = this.packet.content.readUInt8(this.pos)
        this.pos += 1
        return res
    }

    readU16(): number {
        const res = this.packet.content.readUInt16BE(this.pos)
        this.pos += 2
        return res
    }

    readData(): Buffer {
        const size = this.readU16()
        const res = this.packet.content.slice(this.pos, size)
        this.pos += size
        return res
    }

    readRaw(): Buffer {
        const res = this.packet.content.slice(this.pos, this.packet.content.length)
        this.pos = this.packet.content.length
        return res
    }
}