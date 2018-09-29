export default interface Message {
    id: string
    timestamp: number
    authorId: number
    threadId: number
    message: string
    attachments: string[]
}
