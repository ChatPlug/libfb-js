import User from './User'

export default interface Thread {
    id: number
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
