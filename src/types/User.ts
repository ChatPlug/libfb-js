export default interface User {
  id: number
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
