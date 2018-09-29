import { EventEmitter } from "events"
import makeDeviceId from "./FacebookDeviceId"
import FacebookHttpApi from "./FacebookHttpApi"
import MqttApi from "./mqtt/MqttApi"
import PlainFileTokenStorage from "./PlainFileTokenStorage"
import Message from "./types/Message"
import Session from "./types/Session"
import Thread from "./types/Thread"
import User from "./types/User"
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

    async getThreadInfo(threadId: string): Promise<Thread> {
        const thread = (await this.httpApi.threadQuery(threadId))[threadId]
        const customizations = thread.customization_info
        return {
            id: thread.thread_key.thread_fbid || thread.thread_key.other_user_id,
            name: thread.name,
            isGroup: thread.is_group_thread,
            participants: thread.all_participants.nodes
            .map(user => user.messaging_actor)
            .map(this.parseUser),
            image: thread.image,
            unreadCount: thread.unread_count,
            canReply: thread.can_viewer_reply,
            cannotReplyReason: thread.cannot_reply_reason,
            isArchived: thread.has_viewer_archived,
            color: customizations && customizations.outgoing_bubble_color ?
                '#' + customizations.outgoing_bubble_color.substr(2).toLowerCase() : null,
            emoji: customizations ? customizations.custom_like_emoji : null,
            // nicknames: customizations ? customizations.participant_customizations : null
            // TODO: get nicknames
        } as Thread
    }

    async getUserInfo(userId: string): Promise<User> {
        return this.parseUser((await this.httpApi.userQuery(userId))[userId])
    }

    private parseUser(user): User {
        return {
            id: user.id,
            name: user.name,
            type: user.__type__.name,
            canMessage: user.can_viewer_message,
            emailAddresses: user.email_addresses,
            isBlocked: user.is_blocked_by_viewer,
            isMessengerUser: user.is_messenger_user,
            isPage: user.is_commerce,
            profilePicLarge: user.profile_pic_large ? user.profile_pic_large.uri : null,
            profilePicMedium: user.profile_pic_medium ? user.profile_pic_medium.uri : null,
            profilePicSmall: user.profile_pic_small ? user.profile_pic_small.uri : null
        } as User
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
