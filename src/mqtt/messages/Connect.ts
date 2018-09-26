import { TBufferedTransport, TCompactProtocol, Thrift } from "thrift"
import * as zlib from "zlib"
import AuthTokens from "../../types/AuthTokens"
import DeviceId from "../../types/DeviceId"
import MqttMessage from "../MqttMessage"
import { MqttConnectFlag } from "../MqttTypes"
import { FacebookMessageType } from "./MessageTypes"

const USER_AGENT =
    "Facebook plugin / LIBFB-JS / [FBAN/Orca-Android;FBAV/148.0.0.5.83;FBPN/com.facebook.orca;FBLC/en_US;FBBV/26040814]"
enum FacebookCapFlags {
    FB_CP_ACKNOWLEDGED_DELIVERY = 1 << 0,
    FB_CP_PROCESSING_LASTACTIVE_PRESENCEINFO = 1 << 1,
    FB_CP_EXACT_KEEPALIVE = 1 << 2,
    FB_CP_REQUIRES_JSON_UNICODE_ESCAPES = 1 << 3,
    FB_CP_DELTA_SENT_MESSAGE_ENABLED = 1 << 4,
    FB_CP_USE_ENUM_TOPIC = 1 << 5,
    FB_CP_SUPPRESS_GETDIFF_IN_CONNECT = 1 << 6,
    FB_CP_USE_THRIFT_FOR_INBOX = 1 << 7,
    FB_CP_USE_SEND_PINGRESP = 1 << 8,
    FB_CP_REQUIRE_REPLAY_PROTECTION = 1 << 9,
    FB_CP_DATA_SAVING_MODE = 1 << 10,
    FB_CP_TYPING_OFF_WHEN_SENDING_MESSAGE = 1 << 11
}
/**
 * Assembles a connect messages sent just after a TLS connection is established.
 */
export const encodeConnectMessage = (
    tokens: AuthTokens,
    deviceId: DeviceId
): Promise<MqttMessage> => {
    return new Promise<MqttMessage>((res, rej) => {
        const trans = new TBufferedTransport() as any
        trans.onFlush = d => {
            const message = new MqttMessage()
            const flags =
                MqttConnectFlag.User |
                MqttConnectFlag.Pass |
                MqttConnectFlag.Clr |
                MqttConnectFlag.QoS1
            message.writeString("MQTToT")
            message.writeU8(3)
            message.writeU8(flags)
            message.writeU16(60) // KEEP ALIVE
            message.writeRaw(zlib.deflateSync(d))
            message.flags = 0
            message.type = FacebookMessageType.Connect
            res(message)
        }

        const proto = new TCompactProtocol(trans) as any
        // Write client id
        proto.lastFieldId_ = 0
        proto.writeFieldBegin("none", Thrift.Type.STRING, 1)
        proto.writeString(deviceId.clientId)

        proto.lastFieldId_ = 1
        proto.writeFieldBegin("none", Thrift.Type.STRUCT, 4)

        // Write user id
        proto.lastFieldId_ = 0
        proto.writeFieldBegin("none", Thrift.Type.I64, 1)
        proto.writeI64(tokens.uid)

        // Write information
        proto.lastFieldId_ = 1
        proto.writeFieldBegin("none", Thrift.Type.STRING, 2)
        proto.writeString(USER_AGENT)

        // Write some random int (?)
        proto.lastFieldId_ = 2
        proto.writeFieldBegin("None", Thrift.Type.I64, 3)
        proto.writeI64(
            FacebookCapFlags.FB_CP_ACKNOWLEDGED_DELIVERY |
                FacebookCapFlags.FB_CP_PROCESSING_LASTACTIVE_PRESENCEINFO |
                FacebookCapFlags.FB_CP_EXACT_KEEPALIVE |
                FacebookCapFlags.FB_CP_DELTA_SENT_MESSAGE_ENABLED
        )

        // Write some random int (?)
        proto.lastFieldId_ = 3
        proto.writeFieldBegin("None", Thrift.Type.I64, 4)
        proto.writeI64(26)

        // Write some random int (?)
        proto.lastFieldId_ = 4
        proto.writeFieldBegin("None", Thrift.Type.I32, 5)
        proto.writeI32(1)

        // Write no_auto_fg boolean

        proto.lastFieldId_ = 5
        proto.writeFieldBegin("none", Thrift.Type.BOOL, 6)
        proto.writeBool(true)

        // Write visibility state
        proto.lastFieldId_ = 6
        proto.writeFieldBegin("none", Thrift.Type.BOOL, 7)
        proto.writeBool(true)

        // Write device id
        proto.lastFieldId_ = 7
        proto.writeFieldBegin("none", Thrift.Type.STRING, 8)
        proto.writeString(deviceId.deviceId)

        // Write fg boolean
        proto.lastFieldId_ = 8
        proto.writeFieldBegin("none", Thrift.Type.BOOL, 9)
        proto.writeBool(true)

        // nwt int
        proto.lastFieldId_ = 9
        proto.writeFieldBegin("none", Thrift.Type.I32, 10)
        proto.writeI32(1)

        // nwst int
        proto.lastFieldId_ = 10
        proto.writeFieldBegin("none", Thrift.Type.I32, 11)
        proto.writeI32(0)

        // write mqtt id
        proto.lastFieldId_ = 11
        proto.writeFieldBegin("none", Thrift.Type.I64, 12)
        proto.writeI64(deviceId.mqttId)

        // write some random list
        proto.lastFieldId_ = 12
        proto.writeFieldBegin("none", Thrift.Type.LIST, 14)
        proto.writeListBegin(Thrift.Type.I32, 0) // wtf(?)
        proto.writeFieldStop()

        // Write token
        proto.lastFieldId_ = 14
        proto.writeFieldBegin("none", Thrift.Type.STRING, 15)
        proto.writeString(tokens.access_token)
        proto.writeFieldStop()
        proto.writeStructEnd()

        proto.flush()
    })
}
