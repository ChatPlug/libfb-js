import fs from 'fs'
import path from 'path'
import makeDeviceId from './FacebookDeviceId'
import HttpApi from './http/HttpApi'
import MqttApi from './mqtt/MqttApi'
import Session from './types/Session'
import Thread, { parseThread } from './types/Thread'
import User, { parseUser } from './types/User'
import debug from 'debug'
import { Readable } from 'stream'
import { PublishPacket } from './mqtt/messages/Publish'
import Message, { MessageOptions, parseThreadMessage, parseDeltaMessage } from './types/Message'
import parseDeltaEvent from './types/events/parseDeltaEvent'
import EventEmitter from 'events'
import { AttachmentNotFoundError, AttachmentURLMissingError } from './types/Errors'
import StrictEventEmitter from 'strict-event-emitter-types'
import ClientEvents from './ClientEvents'
import * as Payloads from './mqtt/payloads'
import DeviceId from './types/DeviceId'

const debugLog = debug('fblib')

export interface ClientOptions {
  selfListen?: boolean
  session?: Session
  deviceId?: DeviceId
}

type ClientEmitter = StrictEventEmitter<EventEmitter, ClientEvents>

// 🥖
/**
 * Main client class
 */
export default class Client extends (EventEmitter as { new(): ClientEmitter }) {
  private mqttApi: MqttApi
  private httpApi: HttpApi
  private readonly session: Session | null
  private seqId = ''
  loggedIn: boolean = false
  private options: ClientOptions

  constructor (options: ClientOptions = { selfListen: false, session: null }) {
    super()

    this.options = options

    this.mqttApi = new MqttApi()
    this.httpApi = new HttpApi()

    let session = options.session
    if (!session) {
      session = { tokens: null, deviceId: null }
    }

    if (options.deviceId) {
      session.deviceId = options.deviceId
    }

    if (!session.deviceId) {
      const deviceId = makeDeviceId()
      session.deviceId = deviceId
      this.httpApi.deviceId = deviceId.deviceId
    }

    if (session.tokens) {
      this.httpApi.token = session.tokens.access_token
    }

    this.session = session
  }

  async login (email: string, password: string) {
    // trim to check for spaces (which are truthy)
    if (this.loggedIn) throw new Error('Already logged in!')
    if (
      !email || typeof email !== 'string' || !email.trim() ||
      !password || typeof password !== 'string' || !password.trim()
    ) throw new Error('Wrong username/password!')
    await this.doLogin(email, password)
    this.loggedIn = true
  }

  private doLogin (login: string, password: string) {
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

      this.mqttApi.on('publish', async (publish: PublishPacket) => {
        debugLog(publish.topic)
        if (publish.topic === '/send_message_response') {
          const response = JSON.parse(publish.data.toString('utf8'))
          debugLog(response)
          this.mqttApi.emit('sentMessage:' + response.msgid, response)
        }
        if (publish.topic === '/t_ms') this.handleMS(publish.data.toString('utf8'))
      })

      this.mqttApi.on('connected', async () => {
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

  getSession () {
    return this.session
  }

  sendMessage (threadId: string, message: string, options?: MessageOptions) {
    return this.mqttApi.sendMessage(threadId, message, options)
  }

  /**
   * Indicate that the user is currently present in the conversation.
   * Only relevant for non-group conversations
   */
  async sendPresenceState (recipientUserId: string, present: boolean) {
    const payload = new Payloads.PresenceState(recipientUserId, present)
    return this.mqttApi.sendPublish(payload.getTopic(), await Payloads.encodePayload(payload))
  }

  /**
   * Send "User is typing" message.
   * In a non-group conversation, sendPresenceState() must be called first.
   */
  async sendTypingState (threadOrRecipientUserId: string, present: boolean) {
    const payload = new Payloads.TypingState(this.session.tokens.uid, present, threadOrRecipientUserId)
    return this.mqttApi.sendPublish(payload.getTopic(), await Payloads.encodePayload(payload))
  }

  /**
   * Mark a message as read.
   */
  async sendReadReceipt (message: Message) {
    const payload = new Payloads.ReadReceipt(message)
    return this.mqttApi.sendPublish(payload.getTopic(), await Payloads.encodePayload(payload))
  }

  async getThreadList (count: number): Promise<Thread[]> {
    const threads = await this.httpApi.threadListQuery(count)
    return threads.viewer.message_threads.nodes.map(parseThread)
  }

  sendAttachmentFile (threadId: string, attachmentPath: string, extension?: string) {
    if (!fs.existsSync(attachmentPath)) throw new AttachmentNotFoundError(attachmentPath)
    const stream = fs.createReadStream(attachmentPath)
    if (!extension) extension = path.parse(attachmentPath).ext
    const length = fs.statSync(attachmentPath).size.toString()
    return this.httpApi.sendImage(stream, extension, this.session.tokens.uid, threadId, length)
  }

  sendAttachmentStream (threadId: string, extension: string, attachment: Readable) {
    return this.httpApi.sendImage(attachment, extension, this.session.tokens.uid, threadId)
  }

  async getAttachmentURL (messageId: string, attachmentId: string): Promise<string> {
    const attachment = await this.httpApi.getAttachment(messageId, attachmentId)
    if (!attachment.redirect_uri) throw new AttachmentURLMissingError(attachment)
    return attachment.redirect_uri
  }

  getAttachmentInfo (messageId: string, attachmentId: string) {
    return this.httpApi.getAttachment(messageId, attachmentId)
  }

  async getStickerURL (stickerId: number): Promise<string> {
    const sticker = await this.httpApi.getSticker(stickerId)
    return sticker[stickerId.toString()].thread_image.uri
  }

  async getThreadInfo (threadId: string): Promise<Thread> {
    const res = await this.httpApi.threadQuery(threadId)
    const thread = res[threadId]
    if (!thread) return null
    return parseThread(thread)
  }

  async getUserInfo (userId: string): Promise<User> {
    const res = await this.httpApi.userQuery(userId)
    const user = res[userId]
    if (!user) return null
    return parseUser(user)
  }

  async getMessages (threadId: string, count: number): Promise<Message> {
    const res = await this.httpApi.threadMessagesQuery(threadId, count)
    const thread = res[threadId]
    if (!thread) return null
    return thread.messages.nodes.map(message => parseThreadMessage(threadId, message))
  }

  private async createQueue (seqId: number) {

    // sync_api_version 3: You receive /t_ms payloads as json
    // sync_api_version 10: You receiove /t_ms payloads as thrift,
    // and connectQueue() does not have to be called.
    // Note that connectQueue() should always use 10 instead.

    const obj = (
    {
      initial_titan_sequence_id: seqId,
      delta_batch_size: 125,
      device_params: {
        image_sizes: {
          0: '4096x4096',
          4: '312x312',
          1: '768x768',
          2: '420x420',
          3: '312x312'
        },
        animated_image_format: 'WEBP,GIF',
        animated_image_sizes: {
          0: '4096x4096',
          4: '312x312',
          1: '768x768',
          2: '420x420',
          3: '312x312'
        }
      },
      entity_fbid: this.session.tokens.uid,
      sync_api_version: 3,   // Must be 3 instead of 10 to receive json payloads
      encoding: 'JSON',      // Must be removed if using sync_api_version 10
      queue_params: {
        // Array of numbers -> Some bitwise encoding scheme -> base64. Numbers range from 0 to 67
        // Decides what type of /t_ms delta messages you get. Flags unknown, copy-pasted from app.
        client_delta_sync_bitmask: 'Amvr2dBlf7PNgA',
        graphql_query_hashes: {
          xma_query_id: '306810703252313'
        },
        graphql_query_params: {
          306810703252313: {
            xma_id: '<ID>',
            small_preview_width: 624,
            small_preview_height: 312,
            large_preview_width: 1536,
            large_preview_height: 768,
            full_screen_width: 4096,
            full_screen_height: 4096,
            blur: 0.0,
            nt_context: {
              styles_id: 'fe1fd5357bb40c81777dc915dfbd6aa4',
              pixel_ratio: 3.0
            }
          }
        }
      }
    }
  )

    await this.mqttApi.sendPublish(
      '/messenger_sync_create_queue',
      JSON.stringify(obj)
    )
  }

  private async connectQueue (seqId) {

    // If createQueue() uses sync_api_version 10, this does not need to be called, and you will not receive json payloads.
    // If this does not use sync_api_version 10, you will not receive all messages (e.g. reactions )
    // Send the thrift-equivalent payload to /t_ms_gd and you will receive mostly thrift-encoded payloads instead.

    const obj = {
      delta_batch_size: 125,
      max_deltas_able_to_process: 1250,
      sync_api_version: 10, // Must be 10 to receive some messages
      encoding: 'JSON',

      last_seq_id: seqId,
      sync_token: this.session.tokens.syncToken
    }

    await this.mqttApi.sendPublish(
      '/messenger_sync_get_diffs',
      JSON.stringify(obj)
    )
  }

  private async handleMS (ms: string) {
    let data
    try {
      ms = ((ms.indexOf('{"deltas"') > 0) ? ms.substr(ms.indexOf('{"deltas"')) : ms)
      data = JSON.parse(ms.replace('\u0000', ''))
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
      this.handleMessage(delta)
    })
  }

  private handleMessage (event: any) {
    if (event.deltaNewMessage) {
      const message = parseDeltaMessage(event.deltaNewMessage)
      if (!message || message.authorId === this.session.tokens.uid && !this.options.selfListen) return
      this.emit('message', message)
    }

    const deltaEvent = parseDeltaEvent(event)
    if (!deltaEvent) return
    this.emit('event', deltaEvent)
    // @ts-ignore TypeScript somehow doesn't recognize that EventType is compatible with the properties defined in ClientEvents
    this.emit(deltaEvent.type, deltaEvent.event)
  }
}
