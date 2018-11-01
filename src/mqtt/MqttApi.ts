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
import { debuglog } from 'util';

const debugLog = debug("fblib")

/**
 * Handles decoding and sending all sorts of messages used by Facebook Messenger.
 * It utilizes all network primitives defined in the MqttConnection class.
 */
export default class MqttApi extends EventEmitter {
    connection: MqttConnection
    lastMsgId: number = 1
    tokens: AuthTokens
    lastPingMilis: number = -1
    deviceId: DeviceId

    constructor() {
        super()
        this.connection = new MqttConnection()
    }

    sendSubscribe(msg: MqttMessage) {
        this.lastMsgId = this.lastMsgId + 1
        return this.connection.writeMessage(msg)
    }

    /**
     * Connects the MQTT socket and binds listeners for receiving messages.
     * @param tokens
     * @param deviceId
     */
    async connect(tokens: AuthTokens, deviceId: DeviceId) {
        this.tokens = tokens
        this.deviceId = deviceId
        await this.connection.connect()
        this.connection.on("packet", this.parsePacket)
        await this.sendConnectMessage()
        this.connection.on("close", (e) => {
            debuglog("close")
        })
    }
    
    reconnect = async () => {
        await this.connection.connect()
        await this.sendConnectMessage()
        this.connection.emit("reconnect")
    }

    sendPing = () => {
        if (this.lastPingMilis < 0 || (this.lastPingMilis) < (60 * 1000) + (new Date).getTime()) {
            this.connection.writeMessage(encodePing())
        } else {
            // Attempt to reconnect
            this.reconnect()
        }
    }

    /**
     * Sends a CONNECT mqtt message
     */
    async sendConnectMessage() {
        setInterval(this.sendPing, 60 * 1000)
        if (!this.connection._connected) return
        const connectMessage = await encodeConnectMessage(this.tokens, this.deviceId)
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
    sendMessage(threadId: string, message: string) {
        return new Promise(async (resolve, reject) => {
            const milliseconds = Math.floor(new Date().getTime() / 1000)
            const rand = Math.floor(Math.random() * (Math.pow(2, 32) - 1))
            const msgid = Math.abs((rand & 0x3fffff) | (milliseconds << 22))
            const msg = {
                body: message,
                msgid,
                sender_fbid: this.tokens.uid,
                to: threadId
            }
            this.once("sentMessage:" + msgid, resolve)
            await this.sendPublish("/send_message2", JSON.stringify(msg))
        })
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

    parsePacket = async (packet: MqttPacket) => {
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
                this.emit("connected")
                break
            case FacebookMessageType.Publish:
                debugLog("Packet type: Publish")
                const publish = decodePublish(packet)
                this.emit("publish", publish)
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
                this.lastPingMilis  = (new Date()).getTime()
                break
            default:
                debugLog("Packet type:", packet.type)
                debugLog(hexdump(packet.content))
        }
    }
}
