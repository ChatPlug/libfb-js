import MqttApi from "./mqtt/MqttApi"
import FacebookHttpApi from "./FacebookHttpApi"
import PlainFileTokenStorage from "./PlainFileTokenStorage"
import Session from "./types/Session"
import makeDeviceId from "./FacebookDeviceId"

// 🥖
export default class FacebookApi {
    mqttApi: MqttApi
    httpApi: FacebookHttpApi
    session: Session | null
    syncToken = "101284231"
    

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
            console.log(publish.topic)
            if (publish.topic == "/send_message_response") {
                console.log("got msg resp")
                // console.log(publish.content.toString('utf8'))
            }

            if (publish.topic = "/t_ms") {
                console.log(publish.content.toString('utf8'))
            }
        })

        this.mqttApi.on("connected", async () => {
            const d = await this.httpApi.querySeqId();
            console.log(d)
            await this.connectQueue(d.viewer.message_threads.sync_sequence_id)

            const e = await this.httpApi.getAttachment("mid.$cAAAAAWaLyv9sOUaI4lmCAE1tXJmL", '250360039157920')
            console.log("---- dupa")
            console.dir(e)
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
        console.log(seqId)
        const obj = {
            delta_batch_size: 125,
            max_deltas_able_to_process: 1250,
            sync_api_version: 3,
            encoding: 'JSON',

            last_seq_id: seqId,
            sync_token: this.syncToken,
        }

        

        await this.mqttApi.sendPublish("/messenger_sync_get_diffs", JSON.stringify(obj))
    }

    async handleNewMsg(count) {
        if (count > 0) {
            const unreadThreads = await this.httpApi.unreadThreadListQuery(
                count
            )
            console.dir(unreadThreads.viewer.message_threads.nodes)
            console.dir(unreadThreads.viewer.message_threads.nodes[0].last_message.message_sender)
            console.dir(unreadThreads.viewer.message_threads.nodes[0].last_message)
        }
    }
}
