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
export { default as parseDeltaMessage } from './message/parseDeltaMessage'
export { default as parseThreadMessage } from './message/parseThreadMessage'
