import makeDeviceId from './FacebookDeviceId'
import BaseFacebookHttpApi from './BaseFacebookHttpApi'
import FacebookApiHttpRequest from './FacebookApiHttpRequest'

const deviceId = makeDeviceId()
const api = new BaseFacebookHttpApi()
api.deviceId = deviceId.deviceId
api.get(new FacebookApiHttpRequest(
    "https://b-api.facebook.com/method/auth.login",
    null,
    "auth.login",
    "authenticate",
    {
        email: "asd",
        password: "asd",
    })
).then(res => res.json()).then(json => {
    console.dir(json)
}).catch(err => {
    console.error(err)
})
