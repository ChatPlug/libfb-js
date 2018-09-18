import MqttApi from './mqtt/MqttApi';
import FacebookHttpApi from './FacebookHttpApi';
import PlainFileTokenStorage from './PlainFileTokenStorage';
import Session from './types/Session'
import makeDeviceId from './FacebookDeviceId'

// 🥖
export default class FacebookApi {
    mqttApi: MqttApi
    httpApi: FacebookHttpApi
    session: Session | null

    constructor (options: any = {}) {
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

        await this.mqttApi.connect()
        await this.mqttApi.sendConnectMessage(this.session.tokens, this.session.deviceId)
    }
}