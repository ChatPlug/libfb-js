import { parseAttachment } from '../Attachment'
import Message from '../Message'

export default function parseDeltaMessage (delta: any) {
  return {
    threadId: getThreadId(delta),
    attachments: delta.attachments ? delta.attachments.map(parseAttachment) : [],
    authorId: delta.messageMetadata.actorFbId,
    id: delta.messageMetadata.messageId,
    timestamp: delta.messageMetadata.timestamp,
    message: delta.body || '',
    stickerId: delta.stickerId
  } as Message
}

export function getThreadId (delta: any) {
  const { threadKey } = delta.messageMetadata || delta
  return threadKey.threadFbId || threadKey.otherUserFbId
}
