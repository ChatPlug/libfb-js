/*
    AuthTokens is an object returned by api during initialization.
*/
export default interface AuthTokens {
  session_key: string
  uid: string
  secret: string
  access_token: string
  machine_id: string
  identifier: string
  user_storage_key: string
  syncToken?: string | null
}
