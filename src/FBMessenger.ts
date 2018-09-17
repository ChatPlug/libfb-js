import makeDeviceId from "./FacebookDeviceId";
import FacebookHttpApi from "./FacebookHttpApi";
import PlainFileTokenStorage from "./PlainFileTokenStorage";
import Connect from "./mqqt/messages/Connect";
import MqttConnection from "./mqqt/MqttConnection"
import * as zlib from 'zlib'
const dump = require('buffer-hexdump')
import { TTransport, TCompactProtocol, Thrift, TBufferedTransport } from 'thrift'


const login = async (email: string, password: string) => {
  const storage = new PlainFileTokenStorage();
  const deviceId = makeDeviceId();
  const api = new FacebookHttpApi();
  api.deviceId = deviceId.deviceId;

  let tokens = await storage.readSession();
  if (!tokens) {
    tokens = await api.auth(email, password);
    storage.writeSession(tokens);
  } else {
    api.token = tokens.access_token;
  }

  /*const conenction = new MqttConnection();
  conenction.connectMsg = await (new Connect()).encode(tokens, deviceId)
  await conenction.connect()
*/
  await new Promise<Buffer>((res, rej) => {
    const trans = new TBufferedTransport() as any
    trans.onFlush =
        d => {
          console.log(dump(d))
          console.log("\n\n")
            console.log(dump(zlib.deflateSync(d, { level: -1 })))
            res(d)
        }

    const proto = new TCompactProtocol(trans) as any
    // Write client id
    proto.lastFieldId_ = 0
    proto.writeFieldBegin("none", Thrift.Type.STRING, 1)
    proto.writeString("dupa")

    proto.lastFieldId_ = 1
    proto.writeFieldBegin("none", Thrift.Type.STRUCT, 4)

    // Write user id
    proto.lastFieldId_ = 0
    proto.writeFieldBegin("none", Thrift.Type.I64, 1)
    proto.writeI64(0)

    // Write information
    proto.lastFieldId_ = 1
    proto.writeFieldBegin("none", Thrift.Type.STRING, 2)
    proto.writeString("dupa")

    // Write some random int (?)
    proto.lastFieldId_ = 2
    proto.writeFieldBegin("None", Thrift.Type.I64, 3)
    proto.writeI64(23)

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
    proto.writeString("dupa")

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
    proto.writeI64(0)

    // write some random list
    proto.lastFieldId_ = 12
    proto.writeFieldBegin("none", Thrift.Type.LIST, 14)
    proto.writeListBegin(Thrift.Type.LIST, 0) // wtf(?)
    proto.writeFieldStop()

    // Write token

    proto.lastFieldId_ = 14
    proto.writeFieldBegin("none", Thrift.Type.STRING, 15)
    proto.writeString("dupa")
    proto.writeFieldStop()
    proto.writeStructEnd()

    proto.flush()
})
  
};

export default login;
