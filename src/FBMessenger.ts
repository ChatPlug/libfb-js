import makeDeviceId from './FacebookDeviceId'
import FacebookHttpApi from './FacebookHttpApi'
import TokenStorage from './TokenStorage'

const sample = async () => {
    const storage = new TokenStorage()
    const deviceId = makeDeviceId()
    const api = new FacebookHttpApi()
    api.deviceId = deviceId.deviceId
    
    let tokens = storage.readSession()
    if (!tokens) {
        tokens = await api.auth("test", "test")
        storage.writeSession(tokens)
    }
    console.log("done")
}

sample().then().catch()
