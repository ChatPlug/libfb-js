import makeDeviceId from './FacebookDeviceId'
import FacebookHttpApi from './FacebookHttpApi'

const deviceId = makeDeviceId()
const api = new FacebookHttpApi()
api.deviceId = deviceId.deviceId

api.auth("asd", "asd")
    .then(res => {
        console.dir(res)
    })
    .catch(err => {
        console.error(err)
    })
