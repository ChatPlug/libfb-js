import makeDeviceId from './FacebookDeviceId'
import FacebookHttpApi from './FacebookHttpApi'

const deviceId = makeDeviceId()
const api = new FacebookHttpApi()
api.deviceId = deviceId.deviceId

api.auth("asd", "asd")
    .then(res => res.json())
    .then(json => {
        console.dir(json)
    }).catch(err => {
        console.error(err)
    })
