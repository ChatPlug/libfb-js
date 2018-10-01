export default interface User {
  id: number
  name: string
  type: UserType
  canMessage: boolean
  emailAddresses?: string[]
  isBlocked: boolean
  isMessengerUser: boolean
  isPage: boolean
  profilePicLarge: string
  profilePicMedium: string
  profilePicSmall: string
}

enum UserType {
  "User", "Page", "UnavailableMessagingActor", "ReducedMessagingActor"
}