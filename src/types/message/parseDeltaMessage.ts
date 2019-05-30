import { parseAttachment } from '../Attachment'
import Message, { Mention } from '../Message'

export default function parseDeltaMessage (delta: any) {
  return {
    threadId: getThreadId(delta),
    attachments: delta.attachments ? delta.attachments.map(parseAttachment) : [],
    authorId: delta.messageMetadata.actorFbId,
    id: delta.messageMetadata.messageId,
    timestamp: delta.messageMetadata.timestamp,
    message: delta.body || '',
    stickerId: delta.stickerId,
    mentions: (delta.data && delta.data.prng) ? parseMentions(delta.data.prng) : []
  } as Message
}

function parseMentions (prng): Mention[] {
  return JSON.parse(prng).map(mention => ({
    offset: mention.o,
    length: mention.l,
    id: mention.i
  }))
}

export function getThreadId (delta: any) {
  const { threadKey } = delta.messageMetadata || delta
  return (threadKey.threadFbId || threadKey.otherUserFbId).toString()
}
