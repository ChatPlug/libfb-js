import { createHash } from "crypto"
import mime from "mime-types"
import fetch from "node-fetch"
import { Readable } from "stream"
import streamLength from "stream-length"
import FacebookApiHttpRequest from "./FacebookApiHttpRequest"

/**
 * This class wil implement making sick fucking http requests to facebook API by ZUCC.
 * Plz kill me
 * @todo https://github.com/chyla/Kadu/blob/master/plugins/facebook_protocol/qfacebook/http/qfacebook-http-api.cpp#L107
 */

const USER_AGENT =
    "Facebook plugin / LIBFB-JS / [FBAN/Orca-Android;FBAV/148.0.0.20.381;FBPN/com.facebook.orca;FBLC/en_US;FBBV/256002347743983]"

export default class BaseFacebookHttpApi {
    deviceId: string
    token: string

    async get(request: FacebookApiHttpRequest) {
        request.params["api_key"] = "256002347743983"
        request.params["device_id"] = this.deviceId
        request.params["fb_api_req_friendly_name"] = request.friendlyName
        request.params["format"] = "json"
        request.params["method"] = request.method
        request.params["local"] = "pl_PL"
        let dataToHash = request
            .sortedKeys()
            .map(k => k + "=" + request.params[k])
            .join("") // This isn't the same as request.serializeParams(), because no & sign and no escaping. Thanks ZUCC
        dataToHash += "374e60f8b9bb6b8cbb30f78030438895" // ??? xDDDDDD wtf XD
        const sig = createHash("md5")
            .update(dataToHash)
            .digest("hex")
        request.params["sig"] = sig

        const resultingUrl = request.url
        let extraHeaders = {}
        if (this.token) {
            extraHeaders["Authorization"] = "OAuth " + this.token
        }
        const resp = await fetch(resultingUrl, {
            headers: {
                "User-Agent": USER_AGENT,
                "Content-Type":
                    "application/x-www-form-urlencoded; charset=utf-8",
                ...extraHeaders
            },
            method: "POST",
            body: request.serializeParams(),
            compress: true
        })
        if (!resp.ok) {
            throw new Error("Facebook get error: " + (await resp.text()))
        }
        return resp.json()
    }

    async sendImage(
        readStream: Readable,
        extension: string,
        from: number,
        to: number
    ) {
        let randId = ""
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (let i = 0; i < 51; i++) {
            randId += possible.charAt(
                Math.floor(Math.random() * possible.length)
            )
        }

        const len = await streamLength(readStream)
        const resp = await fetch(
            "https://rupload.facebook.com/messenger_image/" + randId,
            {
                headers: {
                    "User-Agent":
                        "Facebook plugin / LIBFB-JS / [FBAN/Orca-Android;FBAV/148.0.0.20.381;FBPN/com.facebook.orca;FBLC/en_US;FBBV/256002347743983]",
                    Authorization: "OAuth " + this.token,
                    device_id: this.deviceId,
                    "X-Entity-Name": "mediaUpload" + extension,
                    is_preview: "1",
                    attempt_id: this.getRandomInt(0, (2 ^ 64) - 1),
                    send_message_by_server: "1",
                    app_id: "256002347743983",
                    "Content-Type": "application/octet-stream",
                    image_type: "FILE_ATTACHMENT",
                    offline_threading_id: this.getRandomInt(0, (2 ^ 64) - 1),
                    "X-FB-Connection-Quality": "EXCELLENT", // kek
                    "X-Entity-Type": mime.lookup(extension),
                    ttl: "0",
                    Offset: "0",
                    "X-FB-Friendly-Name": "post_resumable_upload_session",
                    sender_fbid: from.toString(), // UID
                    to: to.toString(), // RECEIVER
                    "X-FB-HTTP-Engine": "Liger",
                    original_timestamp: "" + Date.now(),
                    "Content-Length": len,
                    "X-Entity-Length": len,
                    client_tags:
                        '{"trigger": "2:thread_view_messages_fragment_unknown"}'
                },
                method: "POST",
                body: readStream
            }
        )
        if (!resp.ok) {
            throw new Error("Got Facebook error: " + (await resp.text()))
        }

        return resp.json()
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}
