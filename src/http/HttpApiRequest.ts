import { createHash } from "crypto"

export interface RequestParams {
    [x: string]: string
}

export interface RequestOptions {
    url: string
    method: string
    friendlyName: string
    params: RequestParams
}

/**
 * COntains all data used by custom facebook http logic.
 */
export default class HttpApiRequest {
    url: string
    method: string
    friendlyName: string
    params: RequestParams

    constructor(options: RequestOptions) {
        this.url = options.url
        this.method = options.method
        this.friendlyName = options.friendlyName
        this.params = options.params
    }

    get sortedKeys() {
        const keys = Object.keys(this.params)
        keys.sort()
        return keys
    }

    serializeParams() {
        const data = this.sortedKeys
            .map(
                k =>
                    encodeURIComponent(k) +
                    "=" +
                    encodeURIComponent(this.params[k])
            )
            .join("&")
        return data
    }

    sign () {
        let data = this.sortedKeys
            .map(k => k + "=" + this.params[k])
            .join("") // This isn't the same as request.serializeParams(), because no & sign and no escaping. Thanks ZUCC
        data += '374e60f8b9bb6b8cbb30f78030438895' // api secret
        this.params.sig = createHash("md5")
            .update(data)
            .digest("hex")
    }
}
