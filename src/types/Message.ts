export default interface Message {
    id: string
    timestamp: number
    authorId: number
    threadId: number
    isGroup: boolean
    message: string
    attachments: string[]
}
