import mime from 'mime-types'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import lengthStream from 'length-stream'
import HttpApiRequest from './HttpApiRequest'
import debug from 'debug'
import RandomIntGenerator from '../RandomIntGenerator'
import { APIError, UploadAPIError } from '../types/Errors'

/**
 * @ignore
 */
const debugLog = debug('fblib')

/**
 * User agent spoofing the mobile Messenger app (version 148.0.0.20.381)
 */
const USER_AGENT = '[FBAN/Orca-Android;FBAV/220.0.0.20.121;]'

/**
 * ¯\\_(ツ)_/¯
 */
const APP_ID = '256002347743983'

/**
 * Base HTTP API class with generic POST method and sendImage helper
 */
export default class BaseHttpApi {
  deviceId: string
  token: string

  async post (request: HttpApiRequest) {
    request.params = {
      ...request.params,
      api_key: APP_ID,
      device_id: this.deviceId,
      fb_api_req_friendly_name: request.friendlyName,
      format: 'json',
      method: request.method,
      locale: 'en_EN'
    }
    request.sign()

    let extraHeaders = {}
    if (this.token) {
      extraHeaders['Authorization'] = 'OAuth ' + this.token
    }
    const resp = await fetch(request.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type':
                    'application/x-www-form-urlencoded; charset=utf-8',
        ...extraHeaders
      },
      method: 'POST',
      body: request.serializeParams(),
      compress: true
    })

    if (!resp.ok) throw new APIError(resp.statusText, await resp.text())

    return resp.json()
  }

  async sendImage (
        readStream: Readable,
        extension: string,
        from: string,
        to: string,
        streamLength?: string
    ) {
    let randId = ''
    const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 51; i++) {
      randId += possible.charAt(
                Math.floor(Math.random() * possible.length)
            )
    }

    const mimeType = extension.includes('/') ? extension : mime.lookup(extension)
    if (mimeType === extension) extension = mime.extension(mimeType)
    debugLog({ mimeType, extension })
    const len = streamLength || await this.streamLength(readStream)
    const resp = await fetch(
            'https://rupload.facebook.com/messenger_image/' + randId,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Authorization: 'OAuth ' + this.token,
          device_id: this.deviceId,
          'X-Entity-Name': 'mediaUpload.' + extension,
          is_preview: '1',
          attempt_id: RandomIntGenerator.generate().toString(),
          send_message_by_server: '1',
          app_id: APP_ID,
          'Content-Type': 'application/octet-stream',
          image_type: 'FILE_ATTACHMENT',
          offline_threading_id: RandomIntGenerator.generate().toString(),
          'X-FB-Connection-Quality': 'EXCELLENT', // kek
          'X-Entity-Type': mimeType,
          ttl: '0',
          Offset: '0',
          'X-FB-Friendly-Name': 'post_resumable_upload_session',
          sender_fbid: from, // UID
          to, // RECEIVER
          'X-FB-HTTP-Engine': 'Liger',
          original_timestamp: '' + Date.now(),
          'Content-Length': len,
          'X-Entity-Length': len,
          client_tags:
                        '{"trigger": "2:thread_view_messages_fragment_unknown"}'
        },
        method: 'POST',
        body: readStream
      }
        )
    if (!resp.ok) throw new UploadAPIError((await resp.json()).debug_info)

    return resp.json()
  }

  streamLength (stream): Promise<string> {
        // it's actually number but node-fetch enforces strings and Facebook doesn't handle them properly?? what
    return new Promise(resolve => stream.pipe(lengthStream(resolve)))
  }
}
