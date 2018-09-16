import makeDeviceId from '../src/FacebookDeviceId'

describe("deviceIds", function() {
    it("makes an uuidv4",  function() {
        const uuid = makeDeviceId()
        if (!uuid.deviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)) {
            throw new Error("Not an uuid")
        }
    })
})
