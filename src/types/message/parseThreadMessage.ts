import Message from '../Message'
import parseXMAAttachment from '../attachments/parseXMAAttachment'
import parseBlobAttachment from '../attachments/parseBlobAttachment'
import { Attachments } from '../attachments/parseAttachments'

export default function parseThreadMessage (threadId: string, message: any) {
  const { fileAttachments, mediaAttachments } = parseAttachments(message)
  return {
    id: message.message_id,
    timestamp: Number(message.timestamp_precise),
    authorId: message.message_sender ? message.message_sender.messaging_actor.id : '',
    threadId,
    message: message.message ? message.message.text : '',
    fileAttachments,
    mediaAttachments,
    stickerId: message.sticker
  } as Message
}

function parseAttachments (message: any): Attachments {
  const fileAttachments = message.blob_attachments ? message.blob_attachments.map(parseBlobAttachment) : []
  // const attachments = message.blob_attachments ? message.blob_attachments : []
  const xma = message.extensible_attachment
  const mediaAttachments = []
  if (xma) mediaAttachments.push(parseXMAAttachment({ [xma.id]: xma }))
  return { fileAttachments, mediaAttachments }
}
