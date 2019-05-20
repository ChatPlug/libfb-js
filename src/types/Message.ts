import Attachment from './Attachment'

export default interface Message {
  id: string
  timestamp: number
  authorId: string
  threadId: string
  message: string
  attachments: Attachment[]
  stickerId?: number
}
export interface Mention {
  offset: number
  length: number
  id: string
}
export interface MessageOptions {
  mentions?: Mention[]
}
export { default as parseDeltaMessage } from './message/parseDeltaMessage'
export { default as parseThreadMessage } from './message/parseThreadMessage'
