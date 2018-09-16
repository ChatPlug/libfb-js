import Message from './Message'
import { TTransport, TCompactProtocol, Thrift, TBufferedTransport } from 'thrift'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'
import MqttMessage from '../MqttMessage';

const USER_AGENT = "Facebook plugin / LIBFB-JS / [FBAN/Orca-Android;FBAV/38.0.0.22.155;FBBV/14477681"

/**
 * Assembles a connect messages sent just after a TLS connection is established.
 */
export default class Connect implements Message {
    async encode(tokens: AuthTokens, deviceId: DeviceId): Promise<Buffer> {
        return new Promise<Buffer>((res, rej) => {
            const trans = new TBufferedTransport() as any
            trans.onFlush =
                d => {
                    const message = new MqttMessage()
                    res(d)
                }

            const proto = new TCompactProtocol(trans)
            // Write client id
            proto.writeFieldBegin("none", Thrift.Type.STRING, 1)
            proto.writeString(deviceId.clientId)

            proto.writeFieldBegin("none", Thrift.Type.STRUCT, 4)

            // Write user id
            proto.writeFieldBegin("none", Thrift.Type.I64, 1)
            proto.writeI64(tokens.uid)

            // Write information
            proto.writeFieldBegin("none", Thrift.Type.STRING, 2)
            proto.writeString(USER_AGENT)

            // Write some random int (?)
            proto.writeFieldBegin("None", Thrift.Type.I64, 3)
            proto.writeI64(23)

            // Write some random int (?)
            proto.writeFieldBegin("None", Thrift.Type.I64, 4)
            proto.writeI64(26)

            // Write some random int (?)
            proto.writeFieldBegin("None", Thrift.Type.I32, 5)
            proto.writeI32(1)

            // Write no_auto_fg boolean
            proto.writeFieldBegin("none", Thrift.Type.BOOL, 6)
            proto.writeBool(true)

            // Write visibility state
            proto.writeFieldBegin("none", Thrift.Type.BOOL, 7)
            proto.writeBool(true)

            // Write device id
            proto.writeFieldBegin("none", Thrift.Type.STRING, 8)
            proto.writeString(deviceId.deviceId)

            // Write fg boolean
            proto.writeFieldBegin("none", Thrift.Type.BOOL, 9)
            proto.writeBool(true)

            // nwt int
            proto.writeFieldBegin("none", Thrift.Type.I32, 10)
            proto.writeI32(1)

            // nwst int
            proto.writeFieldBegin("none", Thrift.Type.I32, 11)
            proto.writeI32(0)

            // write mqtt id
            proto.writeFieldBegin("none", Thrift.Type.I64, 12)
            proto.writeI64(deviceId.mqttId)

            // write some random list
            proto.writeFieldBegin("none", Thrift.Type.LIST, 14)
            proto.writeListBegin(Thrift.Type.LIST, 0) // wtf(?)
            proto.writeFieldStop()

            // Write token
            proto.writeFieldBegin("none", Thrift.Type.STRING, 15)
            proto.writeString(tokens.access_token)
            proto.writeFieldStop()
            proto.writeStructEnd()

            proto.flush()
        })
    }
}
