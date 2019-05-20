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
import Message, { MessageOptions, parseThreadMessage } from './types/Message'
import parseDeltaMessage from './types/message/parseDeltaMessage'
import parseDeltaEvent from './types/events/parseDeltaEvent'
import EventEmitter from 'events'
import { AttachmentNotFoundError, AttachmentURLMissingError } from './types/Errors'
import StrictEventEmitter from 'strict-event-emitter-types'
import ClientEvents from './ClientEvents'

const debugLog = debug('fblib')

export interface ClientOptions {
  selfListen?: boolean
  session?: Session
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

  getThreadList = async (count: number): Promise<Thread[]> => {
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
    const obj = {
      delta_batch_size: 125,
      max_deltas_able_to_process: 1250,
      sync_api_version: 3,
      encoding: 'JSON',

      initial_titan_sequence_id: seqId,
      device_id: this.session.deviceId.deviceId,
      entity_fbid: this.session.tokens.uid,

      queue_params: {
        buzz_on_deltas_enabled: 'false',
        graphql_query_hashes: {
          xma_query_id: '10153919431161729'
        },

        graphql_query_params: {
          '10153919431161729': {
            xma_id: '<ID>'
          }
        }
      }
    }

    await this.mqttApi.sendPublish(
      '/messenger_sync_create_queue',
      JSON.stringify(obj)
    )
  }

  private async connectQueue (seqId) {
    const obj = {
      delta_batch_size: 125,
      max_deltas_able_to_process: 1250,
      sync_api_version: 3,
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
