import * as zlib from 'zlib'
import AuthTokens from '../../types/AuthTokens'
import DeviceId from '../../types/DeviceId'
import MqttMessage from '../MqttMessage'
import { MqttConnectFlag } from '../MqttTypes'
import * as Payloads from '../payloads'
import { MessageType } from './MessageTypes'

const USER_AGENT = '[FBAN/Orca-Android;FBAV/220.0.0.20.121;]'

/**
 * Assembles a connect messages sent just after a TLS connection is established.
 */
export const encodeConnectMessage = async (
    tokens: AuthTokens,
    deviceId: DeviceId
): Promise<MqttMessage> => {
  const payload = new Payloads.Connect(deviceId, tokens, USER_AGENT)
  const flags =
    MqttConnectFlag.User |
    MqttConnectFlag.Pass |
    MqttConnectFlag.Clr |
    MqttConnectFlag.QoS1
  return new MqttMessage(MessageType.Connect)
    .setFlags(MqttConnectFlag.QoS0)
    .writeString('MQTToT')
    .writeU8(3)
    .writeU8(flags)
    .writeU16(60) // KEEP ALIVE
    .writeRaw(zlib.deflateSync(await Payloads.encodePayload(payload)))
}
