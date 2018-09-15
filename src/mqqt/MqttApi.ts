import MqttConnection from "./MqttConnection";

/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi {
  connection: MqttConnection;
}
