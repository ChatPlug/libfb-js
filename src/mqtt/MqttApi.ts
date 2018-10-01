import hexdump from "buffer-hexdump"
import { EventEmitter } from "events"
import AuthTokens from "../types/AuthTokens"
import DeviceId from "../types/DeviceId"
import { encodeConnectMessage } from "./messages/Connect"
import { encodePing } from "./messages/Ping"
import { decodePublish, encodePublish } from "./messages/Publish"
import { encodePublishAck } from "./messages/PublishAck"
import { encodePublishRecorded } from "./messages/PublishRecorded"
import { encodeSubscribeMessage } from "./messages/Subscribe"
import { encodeUnsubscribe } from "./messages/Unsubscribe"
import MqttConnection from "./MqttConnection"
import MqttMessage from "./MqttMessage"
import MqttPacket, { FacebookMessageType } from "./MqttPacket"
import { MqttMessageFlag } from "./MqttTypes"
import debug from "debug"

const debugLog = debug("fblib")

class MqttApiEmitter extends EventEmitter {}
/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi {
    connection: MqttConnection
    _connected = false
    lastMsgId: number = 1
    tokens: AuthTokens
    emitter = new MqttApiEmitter()

    constructor() {
        this.connection = new MqttConnection()
    }

    on(event, cb) {
        this.emitter.on(event, cb)
    }

    sendSubscribe(msg: MqttMessage) {
        this.lastMsgId = this.lastMsgId + 1
        return this.connection.writeMessage(msg)
    }

    async connect() {
        await this.connection.connect()
        this._connected = true
    }

    sendPing = async () => {
        await this.connection.writeMessage(encodePing())
        setTimeout(this.sendPing, 60 * 1000)
    }

    /**
     * Sends a CONNECT mqtt message and binds listeners for recieving messages.
     * @param tokens
     * @param deviceId
     */
    async sendConnectMessage(tokens: AuthTokens, deviceId: DeviceId) {
        this.tokens = tokens
        setTimeout(this.sendPing, 60 * 1000)
        if (!this._connected) {
            return
        }
        this.connection.emitter.on("packet", async (packet: MqttPacket) => {
            switch (packet.type) {
                case FacebookMessageType.ConnectAck:
                    debugLog("Packet type: ConnectAck")
                    await this.sendPublish(
                        "/foreground_state",
                        '{"foreground":true,"keepalive_timeout":60}'
                    )
                    await this.sendSubscribe(
                        encodeSubscribeMessage(this.lastMsgId)
                    )
                    await this.sendSubscribe(encodeUnsubscribe(this.lastMsgId))
                    debugLog("Connected.")

                    // await this.sendMessage()
                    this.emitter.emit("connected")
                    break
                case FacebookMessageType.Publish:
                    debugLog("Packet type: Publish")
                    const publish = decodePublish(packet)
                    this.emitter.emit("publish", publish)
                    this.sendPublishConfirmation(packet.flag, publish)
                    break
                case FacebookMessageType.SubscribeAck:
                    debugLog("Packet type: SubscribeAck")
                    break
                case FacebookMessageType.PublishAck:
                    debugLog("Packet type: PublishAck")
                    break
                case FacebookMessageType.UnsubscribeAck:
                    debugLog("Packet type: UnsubscribeAck")
                    break
                case FacebookMessageType.Pong:
                    debugLog("Packet type: Pong")
                    break
                default:
                    debugLog("Packet type:", packet.type)
                    debugLog(hexdump(packet.content))
            }
        })

        const connectMessage = await encodeConnectMessage(tokens, deviceId)
        await this.connection.writeMessage(connectMessage)
    }

    sendPublish(topic: string, data: string) {
        const packet = encodePublish(this.lastMsgId, topic, data)
        this.lastMsgId += 1
        return this.connection.writeMessage(packet)
    }

    /**
     * Sends a facebook messenger message to someone.
     */
    async sendMessage(threadId: string, message: string) {
        const milliseconds = Math.floor(new Date().getTime() / 1000)
        const rand = Math.floor(Math.random() * (Math.pow(2, 32) - 1))
        const msgid = (rand & 0x3fffff) | (milliseconds << 22)
        const msg = {
            body: message,
            msgid,
            sender_fbid: this.tokens.uid,
            to: threadId
        }
        await this.sendPublish("/send_message2", JSON.stringify(msg))
    }

    async sendPublishConfirmation(flags: number, publish) {
        if (publish.msgId === 0) {
            return
        }

        const qos1 = (flags & MqttMessageFlag.QoS1) == MqttMessageFlag.QoS1
        const qos2 = (flags & MqttMessageFlag.QoS2) == MqttMessageFlag.QoS2
        if (qos1) {
            this.connection.writeMessage(encodePublishAck(publish.msgId))
        }

        if (qos2) {
            this.connection.writeMessage(encodePublishRecorded(publish.msgId))
        }
    }
}
