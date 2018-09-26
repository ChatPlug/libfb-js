import MqttApi from "./mqtt/MqttApi"
import FacebookHttpApi from "./FacebookHttpApi"
import PlainFileTokenStorage from "./PlainFileTokenStorage"
import Session from "./types/Session"
import makeDeviceId from "./FacebookDeviceId"
import fs from 'fs'
import MqttPacket from './mqtt/MqttPacket';
// 🥖
export default class FacebookApi {
    mqttApi: MqttApi
    httpApi: FacebookHttpApi
    session: Session | null
    seqId = ''
    

    constructor(options: any = {}) {
        this.mqttApi = new MqttApi()
        this.httpApi = new FacebookHttpApi()


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

    async doLogin(login: string, password: string) {
        if (!this.session.tokens) {
            const tokens = await this.httpApi.auth(login, password)
            this.httpApi.token = tokens.access_token
            this.session.tokens = tokens

            const storage = new PlainFileTokenStorage()
            storage.writeSession(this.session)
        }

        this.mqttApi.on("publish", async publish => {
            if (publish.topic = "/t_ms") {
                await this.handleMS(publish.content.toString('utf8'))
            }
        })

        this.mqttApi.on("connected", async () => {
            const { viewer } = await this.httpApi.querySeqId()
            const seqId = viewer.message_threads.sync_sequence_id
            this.seqId = seqId
            if (!this.session.tokens.syncToken) {
                await this.createQueue(seqId)
                return
            }

            await this.createQueue(seqId)
            /*
            const stream = fs.createReadStream('dupa.png');
            await this.httpApi.sendImage(stream, ".png", "100009519229821", "100025541190735")
*/
            /*const e = await this.httpApi.getAttachment("mid.$cAAAAAWaLyv9sOUaI4lmCAE1tXJmL", '250360039157920')
            console.log("---- dupa")
            console.dir(e)*/
        })

        await this.mqttApi.connect()
        await this.mqttApi.sendConnectMessage(
            this.session.tokens,
            this.session.deviceId
        )
    }

    async createQueue(seqId) {
        console.log(seqId)
        const obj = {
            delta_batch_size: 125,
            max_deltas_able_to_process: 1250,
            sync_api_version: 3,
            encoding: 'JSON',
            
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

        await this.mqttApi.sendPublish("/messenger_sync_create_queue", JSON.stringify(obj))
    }

    async connectQueue(seqId) {
        const obj = {
            delta_batch_size: 125,
            max_deltas_able_to_process: 1250,
            sync_api_version: 3,
            encoding: 'JSON',

            last_seq_id: seqId,
            sync_token: this.session.tokens.syncToken,
        }

        await this.mqttApi.sendPublish("/messenger_sync_get_diffs", JSON.stringify(obj))
    }

    async handleMS(ms: string) {
        const data = JSON.parse(ms.replace('\u0000', ''))

        // Handled on queue creation
        if (data.syncToken) {
            this.session.tokens.syncToken = data.syncToken
            const storage = new PlainFileTokenStorage()
            await storage.writeSession(this.session)
            await this.connectQueue(this.seqId)
            return
        }

    }
}
