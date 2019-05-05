import User from './User'

export default interface Thread {
  id: string
  name: string
  isGroup: boolean
  participants: User[]
  image: string
  unreadCount: number
  canReply: boolean
  cannotReplyReason: string
  isArchived: boolean
  color: string
  emoji: string
  nicknames: any
}

export { default as parseThread } from './thread/parseThread'
