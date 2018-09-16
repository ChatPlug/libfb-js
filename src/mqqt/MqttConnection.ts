import { TLSSocket, connect as TLSConnect } from "tls";
/**
 * Represents an encrypted real-time connection with facebook servers.
 * This class encapsulates all logic which handles communication using the propietary MQTT-like protocol.
 */
export default class MqttConnection {
  toSend: Buffer
  socket: TLSSocket = null;
  async connect() {
    await new Promise((res, rej) => {
      this.socket = TLSConnect({
        host: "mqtt.facebook.com",
        port: 443
      });
      this.socket.on("secureConnect", res);
      this.socket.on("error", rej);
    });
    console.log("Socket connected")
    const buf = new Buffer(0)
    buf.write
    // send CONNECT message
  }
  
  writeString() {

  }
}
