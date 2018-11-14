import debug from "debug"
import { EventEmitter } from "events"
import { connect as TLSConnect, TLSSocket } from "tls"
import MqttMessage from "./MqttMessage"
import MqttPacket, { MqttHeader } from "./MqttPacket"

const debugLog = debug("fblib")
/**
 * Represents an encrypted real-time connection with facebook servers.
 * This class encapsulates all logic which handles communication using the propietary MQTT-like protocol.
 */
export default class MqttConnection extends EventEmitter {
    toSend: Buffer
    socket: TLSSocket | null = null
    lastHeader: MqttHeader | null = null
    decodeBuffer: Buffer = Buffer.alloc(0)
    connectMsg: any
    _connected: boolean = false
    queue: MqttMessage[] = []

    constructor () {
        super()
        this.on("reconnect", () => {
            if (this.queue.length) {
                const s = setInterval(() => {
                    if (!this.queue.length) return clearInterval(s)
                    this.writeMessage(this.queue.shift())
                }, 200)
            }
        })
    }

    /**
     * Connects to Facebook mqtt servers. The promise is resolved when a secure TLS handshake is established. No CONNECT message is sent yet.
     */
    async connect() {
        await new Promise((res, rej) => {
            this.socket = TLSConnect({
                host: "mqtt.facebook.com",
                port: 443
            })
            this.socket.on("secureConnect", res)
            this.socket.on("error", err => { throw err })
        })

        this._connected = true

        this.socket!!.on("data", data => {
            debugLog("")
            debugLog("Data received!")
            this.readBuffer(data)
        })
        this.socket!!.on("close", _ => {
            this._connected = false
            debugLog(this._connected)
            debugLog("close")
            this.emit("close")
            // throw new Error('Connection closed.')
        })
    }

    // 🥖
    readBuffer(data: Buffer) {
        if (!this.lastHeader) {
            this.lastHeader = this.readHeader(data)
        }

        debugLog("Last header size:", this.lastHeader.size)
        const packetSize = this.lastHeader.i + this.lastHeader.size
        debugLog("Packet size:", packetSize)
        debugLog("Current buffer size:", this.decodeBuffer.length)
        debugLog("Received buffer size:", data.length)
        this.decodeBuffer = Buffer.concat([
            this.decodeBuffer,
            data.slice(0, packetSize)
        ])
        if (this.decodeBuffer.length < packetSize) return // current data is less than we need; wait for more
        else if (this.decodeBuffer.length > packetSize) { // current data is more than we need; use it as another packet
            this.emitPacket()
            this.lastHeader = null
            this.readBuffer(data.slice(packetSize, data.length))
        } else { // current data is exactly the amount of data we need; just parse it
            this.emitPacket()
            this.lastHeader = null
        }
    }

    emitPacket() {
        const header = this.lastHeader
        const packet = {
            type: this.decodeBuffer[0] >> 4,
            flag: this.decodeBuffer[0] & 0x0f,
            content: this.decodeBuffer.slice(header.i, header.i + header.size)
        } as MqttPacket
        this.emit("packet", packet)
        this.decodeBuffer = Buffer.alloc(0)
    }

    async writeMessage(message: MqttMessage) {
        if (!this._connected) return this.queue.push(message)
        let size = message.toSend.byteLength
        let result = Buffer.alloc(1)
        let byte = ((message.type & 0x0f) << 4) | (message.flags & 0x0f)
        result.writeUInt8(byte, 0)

        do {
            let byte = size & 0x7f
            size >>= 7
            if (size > 0) byte |= 0x80

            let buf = Buffer.alloc(1)
            buf.writeUInt8(byte, 0)
            result = Buffer.concat([result, buf])
        } while (size > 0)

        return new Promise<void>((res, rej) => {
            if (this.socket!!.destroyed) return
            this.socket!!.write(Buffer.concat([result, message.toSend]), res)
        })
    }

    /**
     * Parses a MQTT header.
     * @param data The binary data representing the header.
     */
    readHeader(data: Buffer): MqttHeader {
        let size = 0
        let m = 1
        let i = 1
        let byte = 0
        do {
            if (data.length < i + 1)
                throw new Error("Header couldn't be parsed.")
            byte = data[i]
            size += (byte & 0x7f) * m
            m <<= 7
            i++
        } while ((byte & 0x80) !== 0)

        return { size, i } as MqttHeader
    }
}
