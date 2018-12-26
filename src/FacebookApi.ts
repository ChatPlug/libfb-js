import fs from "fs"
import path from "path"
import ApiEmitter from "./ApiEmitter"
import makeDeviceId from "./FacebookDeviceId"
import FacebookHttpApi from "./FacebookHttpApi"
import MqttApi from "./mqtt/MqttApi"
import Session from "./types/Session"
import Thread from "./types/Thread"
import User from "./types/User"
import debug from "debug"
import { Readable } from 'stream';
import { PublishPacket } from './mqtt/messages/Publish'
import * as util from 'util'

const debugLog = debug("fblib")

export interface FacebookApiOptions {
    selfListen?: boolean
    session?: Session
}

// 🥖
export default class FacebookApi {
    mqttApi: MqttApi
    httpApi: FacebookHttpApi
    emitter: ApiEmitter
    session: Session | null
    seqId = ""
    options: FacebookApiOptions

    constructor(options: FacebookApiOptions = { selfListen: false, session: null }) {
        this.mqttApi = new MqttApi()
        this.httpApi = new FacebookHttpApi()

        let session = options.session
        if (!session) {
            session = { tokens: null, deviceId: null }
        }

        if (!session.deviceId) {
            const deviceId = makeDeviceId()
            session.deviceId = deviceId
            session = { deviceId, tokens: null }
        }

        if (session.tokens) {
            this.httpApi.token = session.tokens.access_token
        }

        this.session = session
        this.emitter = new ApiEmitter(options, session)
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
                let tokens
                try {
                    tokens = await this.httpApi.auth(login, password)
                } catch (err) {
                    return reject(err)
                }
                this.httpApi.token = tokens.access_token
                this.session.tokens = tokens
            }
    
            this.mqttApi.on("publish", async (publish: PublishPacket) => {
                debugLog(publish.topic)
                if (publish.topic === "/send_message_response") {
                    const response = JSON.parse(publish.data.toString('utf8'))
                    debugLog(response)
                    this.mqttApi.emit("sentMessage:" + response.msgid, response)
                }
                if (publish.topic === "/t_ms") this.handleMS(publish.data.toString("utf8"))
            })
    
            this.mqttApi.on("connected", async () => {
                let viewer
                try {
                    ({ viewer } = await this.httpApi.querySeqId())
                } catch (err) {
                    return reject(err)
                }
                const seqId = viewer.message_threads.sync_sequence_id
                this.seqId = seqId
                resolve()
                if (!this.session.tokens.syncToken) {
                    await this.createQueue(seqId)
                    return
                }
    
                await this.createQueue(seqId)
            })

            try {
                await this.mqttApi.connect(
                    this.session.tokens,
                    this.session.deviceId
                )
            } catch (err) {
                return reject(err)
            }
        })
    }

    getSession() {
        return this.session
    }

    sendMessage = (threadId: number, message: string) => {
        return this.mqttApi.sendMessage(threadId.toString(), message)
    }

    getThreadList = async (count: number) => {
        const threads = await this.httpApi.threadListQuery(count)
        return threads.viewer.message_threads.nodes.map(this.parseThread)
    }

    sendAttachmentFile = (threadId: number, attachmentPath: string, extension?: string) => {
        if (!fs.existsSync(attachmentPath)) throw new Error('Attachment missing! ' + attachmentPath)
        const stream = fs.createReadStream(attachmentPath)
        if (!extension) extension = path.parse(attachmentPath).ext
        const length = fs.statSync(attachmentPath).size.toString()
        return this.httpApi.sendImage(stream, extension, this.session.tokens.uid, threadId, length)
    }

    sendAttachmentStream = (threadId: number, extension: string, attachment: Readable) => {
        return this.httpApi.sendImage(attachment, extension, this.session.tokens.uid, threadId)
    }
    
    getAttachmentURL = async (messageId: string, attachmentId: string) => {
        const attachment = await this.httpApi.getAttachment(messageId, attachmentId)
        if (!attachment.redirect_uri) throw new Error('Could not get attachment URL! Attachment:\n' + util.inspect(attachment))
        return attachment.redirect_uri
    }

    getAttachmentInfo = async (messageId: string, attachmentId: string) => {
        const attachment = await this.httpApi.getAttachment(messageId, attachmentId)
        return attachment
    }

    getStickerURL = async (stickerId: number) => {
        const sticker = await this.httpApi.getSticker(stickerId)
        return sticker[stickerId.toString()].thread_image.uri
    }

    getThreadInfo = async (threadId: number): Promise<Thread> => {
        const res = await this.httpApi.threadQuery(threadId.toString())
        const thread = res[threadId]
        if (!thread) return null
        return this.parseThread(thread)
    }

    getUserInfo = async (userId: number): Promise<User> => {
        const res = await this.httpApi.userQuery(userId.toString())
        const user = res[userId.toString()]
        if (!user) return null
        return this.parseUser(user)
    }

    private parseUser(user): User {
        return {
            id: Number(user.id),
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

    private parseThread = thread => {
        const customizations = thread.customization_info
        return {
            id: Number(thread.thread_key.thread_fbid || thread.thread_key.other_user_id),
            name: thread.name,
            isGroup: thread.is_group_thread,
            participants: thread.all_participants ?
                thread.all_participants.nodes
                    .map(user => user.messaging_actor || user)
                    .map(this.parseUser) :
                null,
            image: thread.image ? thread.image.uri : null,
            unreadCount: thread.unread_count,
            canReply: thread.can_viewer_reply,
            cannotReplyReason: thread.cannot_reply_reason,
            isArchived: thread.has_viewer_archived,
            color: customizations && customizations.outgoing_bubble_color ?
                '#' + customizations.outgoing_bubble_color.substr(2).toLowerCase() : null,
            emoji: customizations ? customizations.custom_like_emoji : null,
            nicknames: customizations ? customizations.participant_customizations : null
        } as Thread
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
        let data
        try {
            data = JSON.parse(ms.replace("\u0000", ""))
        } catch (err) {
            console.error('Error while parsing the following message:')
            console.error(ms)
            return
        }
        

        // Handled on queue creation
        if (data.syncToken) {
            this.session.tokens.syncToken = data.syncToken
            await this.connectQueue(this.seqId)
            return
        }

        if (!data.deltas || !Array.isArray(data.deltas)) return

        data.deltas.forEach(delta => {
            debugLog(delta)
            this.emitter.handleMessage(delta)
        })
    }
}
