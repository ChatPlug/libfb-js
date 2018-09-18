import { TLSSocket, connect as TLSConnect } from "tls";
import MqttMessage from "./MqttMessage";
import MqttPacket, { MqttHeader } from './MqttPacket';
const dump = require('buffer-hexdump')
/**
 * Represents an encrypted real-time connection with facebook servers.
 * This class encapsulates all logic which handles communication using the propietary MQTT-like protocol.
 */
export default class MqttConnection {
  toSend: Buffer;
  socket: TLSSocket | null = null;
  lastHeader: MqttHeader | null = null
  decodeBuffer: Buffer = Buffer.alloc(0)
  connectMsg: any;
  async connect() {
    await new Promise((res, rej) => {
      this.socket = TLSConnect({
        host: "mqtt.facebook.com",
        port: 443
      });
      this.socket.on("secureConnect", res);
      this.socket.on("error", rej);
    });

    this.socket!!.on("data", data => {
      if (!this.lastHeader) {
        this.lastHeader = this.readHeader(data)
      }
      
      this.decodeBuffer = Buffer.concat([this.decodeBuffer, data])
      if ((this.lastHeader.i + this.lastHeader.size) > data.length) {
      } else {
        this.emitPacket()
        this.lastHeader = null
      }
    })
    this.socket!!.on("close", _ => {
      console.log("Socket closed");
    });
    console.log("Socket connected");
    await this.writeMessage(this.connectMsg);
  }

  emitPacket() {
    console.log("packet received")
    const header = this.lastHeader
    const packet = {
      type: this.decodeBuffer[0] >> 4,
      flag: this.decodeBuffer[0] & 0x0F,
      content: this.decodeBuffer.slice(header.i, header.i + header.size)
    } as MqttPacket
    console.dir(packet)
  }

  async writeMessage(message: MqttMessage) {
    let size = message.toSend.byteLength;
    let result = Buffer.alloc(1);
    let byte = (message.type << 4) | (message.flags & 0x0f);
    result.writeUInt8(byte, 0);

    do {
      let byte = size & 0x7f;
      size >>= 7;
      if (size > 0) byte |= 0x80;

      let buf = Buffer.alloc(1);
      buf.writeUInt8(byte, 0);
      result = Buffer.concat([result, buf]);
    } while (size > 0);

    return new Promise<void>((res, rej) => {
      this.socket!!.write(Buffer.concat([result, message.toSend]), () => {
        res();
      });
    });
  }

  readHeader(data: Buffer): MqttHeader {
    let size = 0
    let m = 1;
    let i = 1;
    let byte = 0;
    do {
      if (data.length < i + 1) throw new Error('Header couldn\'t be parsed.')
      byte = data[i]
      size += (byte & 0x7f) * m
      m <<= 7
      i++
    } while ((byte & 0x80) !== 0)
  
    return { size, i } as MqttHeader
  }
}
