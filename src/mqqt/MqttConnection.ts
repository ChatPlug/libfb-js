import { TLSSocket, connect as TLSConnect } from "tls";

/**
 * Represents an encrypted real-time connection with facebook servers.
 * This class encapsulates all logic which handles communication using the propietary MQTT-like protocol.
 */
export default class MqttConnection {
  socket: TLSSocket = null;
  async connect() {
    await new Promise((res, rej) => {
      this.socket = TLSConnect({
        host: "???", //TODO: add hosts/ports
        port: 420
        // ...
      });
      this.socket.on("secureConnect", res);
      this.socket.on("error", rej);
    });
    console.log("Socket connected")
    // send CONNECT message
  }
  sendMessage() {}
}
