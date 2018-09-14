import makeDeviceId from './FacebookDeviceId'
import BaseFacebookHttpApi from './BaseFacebookHttpApi'
import FacebookApiHttpRequest from './FacebookApiHttpRequest'

const deviceId = makeDeviceId()
const api = new BaseFacebookHttpApi()
api.deviceId = deviceId.deviceId
api.get(new FacebookApiHttpRequest(
    "https://b-api.facebook.com/method/auth.login",
    null,
    "authenticate",
    "auth.login",
    {
        login: "asd",
        password: "asd",
    })
).then((el) => {
    console.log(el.body)
}).catch((el) => {
    console.log(el)
})
