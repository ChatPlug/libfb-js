import User from '../User'

export default function parseUser (user: any) {
  return {
    id: user.id,
    name: user.name,
    type: user.__type__.name,
    canMessage: user.can_viewer_message,
    emailAddresses: user.email_addresses,
    isBlocked: user.is_blocked_by_viewer,
    isMessengerUser: user.is_messenger_user,
    isPage: user.is_commerce,
    profilePicLarge: user.profile_pic_large ? user.profile_pic_large.uri : null,
    profilePicMedium: user.profile_pic_medium ? user.profile_pic_medium.uri : null,
    profilePicSmall: user.profile_pic_small ? user.profile_pic_small.uri : null
  } as User
}
