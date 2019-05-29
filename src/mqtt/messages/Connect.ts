import { TBufferedTransport, TCompactProtocol, Thrift } from 'thrift'
import * as zlib from 'zlib'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'
import MqttMessage from '../MqttMessage'
import { MqttConnectFlag, MqttMessageFlag } from '../MqttTypes'
import { MessageType } from './MessageTypes'
import * as Payloads from '../payloads'

const USER_AGENT =
    'Facebook plugin / LIBFB-JS / [FBAN/Orca-Android;FBAV/148.0.0.5.83;FBPN/com.facebook.orca;FBLC/en_US;FBBV/26040814]'

/**
 * Assembles a connect messages sent just after a TLS connection is established.
 */
export const encodeConnectMessage = async (
    tokens: AuthTokens,
    deviceId: DeviceId
): Promise<MqttMessage> => {
  const payload = new Payloads.Connect(deviceId, tokens, USER_AGENT)

  const message = new MqttMessage()
  const flags =
        MqttConnectFlag.User |
        MqttConnectFlag.Pass |
        MqttConnectFlag.Clr |
        MqttConnectFlag.QoS1
  message.writeString('MQTToT')
  message.writeU8(3)
  message.writeU8(flags)
  message.writeU16(60) // KEEP ALIVE
  message.writeRaw(zlib.deflateSync(await Payloads.encodePayload(payload)))
  message.flags = 0
  message.type = FacebookMessageType.Connect

  return message
}
