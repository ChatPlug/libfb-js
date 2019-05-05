import AuthTokens from './AuthTokens'
import DeviceId from './DeviceId'

export default interface Session {
  tokens: AuthTokens | null
  deviceId: DeviceId | null
}
