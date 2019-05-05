export default interface User {
  id: string
  name: string
  type: string
  canMessage: boolean
  emailAddresses?: string[]
  isBlocked: boolean
  isMessengerUser: boolean
  isPage: boolean
  profilePicLarge: string
  profilePicMedium: string
  profilePicSmall: string
}
export { default as parseUser } from './user/parseUser'
