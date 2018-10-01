import User from './User'

export default interface Thread {
    id: number
    name: string
    isGroup: boolean
    participants: User[]
    image: string
    unreadCount: number
    canReply: boolean
    cannotReplyReason: CannotReplyReason
    isArchived: boolean
    color: string
    emoji: string
    nicknames: any
}

enum CannotReplyReason {
    null,
    "RECIPIENTS_NOT_LOADABLE",
    "BLOCKED"
}