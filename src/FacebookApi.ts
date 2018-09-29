import { EventEmitter } from "events"
import makeDeviceId from "./FacebookDeviceId"
import FacebookHttpApi from "./FacebookHttpApi"
import MqttApi from "./mqtt/MqttApi"
import PlainFileTokenStorage from "./PlainFileTokenStorage"
import Message from "./types/Message"
import Session from "./types/Session"
import debug from "debug"

const debugLog = debug("fblib")
class ApiEmitter extends EventEmitter {}

interface FacebookApiOptions {
    selfListen: boolean
}

// 🥖
export default class FacebookApi {
    mqttApi: MqttApi
    httpApi: FacebookHttpApi
    emitter = new ApiEmitter()
    session: Session | null
    seqId = ""
    options: FacebookApiOptions

    constructor(options: FacebookApiOptions = { selfListen: false }) {
        this.mqttApi = new MqttApi()
        this.httpApi = new FacebookHttpApi()
        this.options = options

        const storage = new PlainFileTokenStorage()

        let session = storage.readSession()
        if (!session) {
            session = { tokens: null, deviceId: null }
        }

        if (!session.deviceId) {
            const deviceId = makeDeviceId()
            session.deviceId = deviceId
            storage.writeSession({ deviceId, tokens: null })
        }

        if (session.tokens) {
            this.httpApi.token = session.tokens.access_token
        }

        this.session = session
    }

    on(event, callback) {
        this.emitter.on(event, callback)
    }

    once(event, callback) {
        this.emitter.once(event, callback)
    }

    doLogin(login: string, password: string) {
        return new Promise(async (resolve, reject) => {
            if (!this.session.tokens) {
                const tokens = await this.httpApi.auth(login, password)
                this.httpApi.token = tokens.access_token
                this.session.tokens = tokens
    
                const storage = new PlainFileTokenStorage()
                storage.writeSession(this.session)
            }
    
            this.mqttApi.on("publish", async publish => {
                debugLog(publish.topic)
                if (publish.topic === "/t_ms") this.handleMS(publish.content.toString("utf8"))
            })
    
            this.mqttApi.on("connected", async () => {
                const { viewer } = await this.httpApi.querySeqId()
                const seqId = viewer.message_threads.sync_sequence_id
                this.seqId = seqId
                resolve()
                if (!this.session.tokens.syncToken) {
                    await this.createQueue(seqId)
                    return
                }
    
                await this.createQueue(seqId)
            })
    
            await this.mqttApi.connect()
            await this.mqttApi.sendConnectMessage(
                this.session.tokens,
                this.session.deviceId
            )
        })
    }

    sendMessage(threadId: string, message: string) {
        return this.mqttApi.sendMessage(threadId, message)
    }

    private async createQueue(seqId) {
        const obj = {
            delta_batch_size: 125,
            max_deltas_able_to_process: 1250,
            sync_api_version: 3,
            encoding: "JSON",

            initial_titan_sequence_id: seqId,
            device_id: this.session.deviceId.deviceId,
            entity_fbid: this.session.tokens.uid,

            queue_params: {
                buzz_on_deltas_enabled: "false",
                graphql_query_hashes: {
                    xma_query_id: "10153919431161729"
                },

                graphql_query_params: {
                    "10153919431161729": {
                        xma_id: "<ID>"
                    }
                }
            }
        }

        await this.mqttApi.sendPublish(
            "/messenger_sync_create_queue",
            JSON.stringify(obj)
        )
    }

    private async connectQueue(seqId) {
        const obj = {
            delta_batch_size: 125,
            max_deltas_able_to_process: 1250,
            sync_api_version: 3,
            encoding: "JSON",

            last_seq_id: seqId,
            sync_token: this.session.tokens.syncToken
        }

        await this.mqttApi.sendPublish(
            "/messenger_sync_get_diffs",
            JSON.stringify(obj)
        )
    }

    private async handleMS(ms: string) {
        const data = JSON.parse(ms.replace("\u0000", ""))

        // Handled on queue creation
        if (data.syncToken) {
            this.session.tokens.syncToken = data.syncToken
            const storage = new PlainFileTokenStorage()
            await storage.writeSession(this.session)
            await this.connectQueue(this.seqId)
            return
        }

        if (!data.deltas || !data.deltas.length) return
        const event = data.deltas[0]
        debugLog(event)

        if (event.deltaNewMessage) {
            const delta = event.deltaNewMessage
            let { threadKey } = delta.messageMetadata
            let threadId = threadKey.threadFbId || threadKey.otherUserFbId
            let isGroup = Boolean(threadKey.threadFbId)

            const message = {
                isGroup,
                threadId,
                attachments: [],
                authorId: delta.messageMetadata.actorFbId,
                id: delta.messageMetadata.messageId,
                timestamp: delta.messageMetadata.timestamp,
                message: delta.body || ""
            } as Message

            if (message.authorId === this.session.tokens.uid && !this.options.selfListen) return
            this.emitter.emit("message", message)
            return
        }

        if (event.deltaDeliveryReceipt) {
            return // @TODO
        }

        if (event.deltaReadReceipt) {
            return //@TODO
        }
    }
}
