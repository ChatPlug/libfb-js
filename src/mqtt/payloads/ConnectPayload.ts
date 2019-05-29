import Payload from './Payload'
import { Thrift, TCompactProtocol, Int64 } from 'thrift'
import FacebookCapFlags from '../../types/FacebookCapFlags'
import Long from 'long'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'

export default class ConnectRequest extends Payload {
  deviceId: DeviceId
  tokens: AuthTokens
  userAgent: string

  constructor (deviceId: DeviceId, tokens: AuthTokens, userAgent: string) {
    super()
    this.deviceId = deviceId
    this.tokens = tokens
    this.userAgent = userAgent
  }

  encode (proto: TCompactProtocol): Promise<void> {
    proto.writeFieldBegin('clientIdentifier', Thrift.Type.STRING, 1)
    proto.writeString(this.deviceId.clientId)

    proto.writeFieldBegin('clientInfo', Thrift.Type.STRUCT, 4)
    proto.writeStructBegin('clientInfo')

    // Write user id
    proto.writeFieldBegin('userId', Thrift.Type.I64, 1)
    proto.writeI64(new Int64(Buffer.from(Long.fromString(this.tokens.uid.toString()).toBytes())))

    // Write information
    proto.writeFieldBegin('userAgent', Thrift.Type.STRING, 2)
    proto.writeString(this.userAgent)

    // Write some random int (?)
    proto.writeFieldBegin('clientCapabilities', Thrift.Type.I64, 3)
    proto.writeI64(
                FacebookCapFlags.FB_CP_ACKNOWLEDGED_DELIVERY |
                    FacebookCapFlags.FB_CP_PROCESSING_LASTACTIVE_PRESENCEINFO |
                    FacebookCapFlags.FB_CP_EXACT_KEEPALIVE |
                    FacebookCapFlags.FB_CP_LARGE_PAYLOAD_SUPPORTED |
                    FacebookCapFlags.FB_CP_DELTA_SENT_MESSAGE_ENABLED)

    proto.writeFieldBegin('endpointCapabilities', Thrift.Type.I64, 4)
    proto.writeI64(26)          // 0011010 libfb default
    // proto.writeI64(90)       // 1011010 used by app

    // 1: ZLIB
    // 2: ZLIB_OPTIONAL
    // 3: RAW
    proto.writeFieldBegin('publishFormat', Thrift.Type.I32, 5)
    proto.writeI32(1)

    // Write no_auto_fg boolean
    proto.writeFieldBegin('noAutomaticForeground', Thrift.Type.BOOL, 6)
    proto.writeBool(false)

    // Write visibility state
    proto.writeFieldBegin('makeUserAvailableInForeground', Thrift.Type.BOOL, 7)
    proto.writeBool(true)

    // Write device id
    proto.writeFieldBegin('deviceId', Thrift.Type.STRING, 8)
    proto.writeString(this.deviceId.deviceId)

    // Write fg boolean
    proto.writeFieldBegin('isInitiallyForeground', Thrift.Type.BOOL, 9)
    proto.writeBool(true)

    // nwt int
    proto.writeFieldBegin('networkType', Thrift.Type.I32, 10)
    proto.writeI32(1)

    // nwst int
    proto.writeFieldBegin('networkSubtype', Thrift.Type.I32, 11)
    proto.writeI32(0)

    // write mqtt id
    proto.writeFieldBegin('clientMqttSessionId', Thrift.Type.I64, 12)
    proto.writeI64(this.deviceId.mqttId)

    // Topics subscribed to by the app.
    // libfb sends a separate subscribe message later, so this is effectively unused.
    // const topics = [155, 107, 150, 140, 174, 34, 59, 195, 92, 131, 75, 103, 90, 62, 98, 72, 85, 100, 86, 65, 63];
    const topics = []
    proto.writeFieldBegin('subscribeTopics', Thrift.Type.LIST, 14)
    proto.writeListBegin(Thrift.Type.I32, topics.length)
    {
      for (const topic of topics) {
        proto.writeI32(topic)
      }
    }

    // Meaning of value not known
    proto.writeFieldBegin('clientType', Thrift.Type.STRING, 15)
    proto.writeString('')

    // Meaning of value not known
    proto.writeFieldBegin('regionPreference', Thrift.Type.STRING, 19)
    proto.writeString('ATN')

    // Meaning of value not known
    proto.writeFieldBegin('deviceSecret', Thrift.Type.STRING, 20)
    proto.writeString('')

    // Meaning of value not known
    proto.writeFieldBegin('clientStack', Thrift.Type.BYTE, 21)
    proto.writeByte(4)

    // Meaning of value not known
    proto.writeFieldBegin('networkTypeInfo', Thrift.Type.I32, 27)
    proto.writeI32(7)

    // End of object
    proto.writeByte(0)

    proto.writeStructEnd()

    proto.writeFieldBegin('password', Thrift.Type.STRING, 5)
    proto.writeString(this.tokens.access_token)

    proto.writeFieldBegin('combinedPublishes', Thrift.Type.LIST, 8)
    proto.writeListBegin(Thrift.Type.STRUCT, 0)

    proto.writeFieldBegin('phpOverride', Thrift.Type.STRUCT, 11)
    proto.writeStructBegin('phpOverride')

    proto.writeFieldBegin('port', Thrift.Type.I32, 2)
    proto.writeI32(0)

    // End of object
    proto.writeByte(0)

    proto.writeStructEnd()

    proto.writeByte(0)

    return null
  }
}
