import { TLSSocket, connect as TLSConnect } from "tls";
import MqttMessage from "./MqttMessage";
/**
 * Represents an encrypted real-time connection with facebook servers.
 * This class encapsulates all logic which handles communication using the propietary MQTT-like protocol.
 */
export default class MqttConnection {
  toSend: Buffer;
  socket: TLSSocket | null = null;
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
      console.log("data recieved", data);
    });
    this.socket!!.on("close", _ => {
      console.log("Socket closed");
    });
    console.log("Socket connected");
    await this.writeMessage(this.connectMsg);
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
        console.log("okok");
        res();
      });
    });
  }
}
