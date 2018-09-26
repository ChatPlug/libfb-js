import MqttConnection from "./MqttConnection"
import MqttPacket, { FacebookMessageType } from './MqttPacket'
import AuthTokens from '../types/AuthTokens'
import DeviceId from '../types/DeviceId'
import { encodeConnectMessage } from './messages/Connect'
import { encodeSubscribeMessage } from './messages/Subscribe'
import { decodePublish, encodePublish } from './messages/Publish'
import { encodePublishRecorded } from './messages/PublishRecorded'
import { encodePublishAck } from './messages/PublishAck'
import MqttMessage from './MqttMessage'
import { MqttMessageFlag } from './MqttTypes';
import { encodeUnsubscribe } from './messages/Unsubscribe';
import { encodePing } from './messages/Ping';
import { EventEmitter } from 'events';
import hexdump from "buffer-hexdump"

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
                    console.log("Packet type: ConnectAck")
                    await this.sendPublish(
                        "/foreground_state",
                        '{"foreground":true,"keepalive_timeout":60}'
                    )
                    await this.sendSubscribe(
                        encodeSubscribeMessage(this.lastMsgId)
                    )
                    await this.sendSubscribe(encodeUnsubscribe(this.lastMsgId))
                    console.log("Connected.")

                    // await this.sendMessage()
                    this.emitter.emit("connected")
                    break
                case FacebookMessageType.Publish:
                    console.log("Packet type: Publish")
                    const publish = decodePublish(packet)
                    this.emitter.emit("publish", publish)
                    this.sendPublishConfirmation(packet.flag, publish)
                    break                
                case FacebookMessageType.SubscribeAck:
                    console.log("Packet type: SubscribeAck")
                    break
                case FacebookMessageType.PublishAck:
                    console.log("Packet type: PublishAck")
                    break
                case FacebookMessageType.UnsubscribeAck:
                    console.log("Packet type: UnsubscribeAck")
                    break
                default:
                    console.log("Packet type:", packet.type)
                    console.log(hexdump(packet.content))
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
    sendMessage(message: string, threadID: string) {
        const milliseconds = Math.floor(new Date().getTime() / 1000)
        const rand = this.getRandomInt(0, 2 ^ (32 - 1))
        const msgid = (rand & 0x3fffff) | (milliseconds << 22)
        const msg = {
            body: message,
            msgid,
            sender_fbid: this.tokens.uid,
            to: threadID
        }
        return this.sendPublish("/send_message2", JSON.stringify(msg))
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
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
