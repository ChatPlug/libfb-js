import { FileAttachment, XMAAttachment } from './Attachment'

export default interface Message {
  id: string
  timestamp: number
  authorId: string
  threadId: string
  message: string
  fileAttachments: FileAttachment[],
  mediaAttachments: XMAAttachment[]
  stickerId?: number,
  mentions?: Mention[]
}
export interface Mention {
  offset: number
  length: number
  id: string
}
export interface MessageOptions {
  mentions?: Mention[]
}
export { default as parseDeltaMessage, getThreadId } from './message/parseDeltaMessage'
export { default as parseThreadMessage } from './message/parseThreadMessage'
