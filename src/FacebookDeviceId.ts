import DeviceId from "./types/DeviceId"
import RandomIntGenerator from "./RandomIntGenerator"

const makeUuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export default () => {
    const uuid = makeUuidv4()
    const deviceId = uuid
    const clientId = uuid.substring(0, 19)
    const mqttId = RandomIntGenerator.generate()
    return { clientId, deviceId, mqttId } as DeviceId
}
