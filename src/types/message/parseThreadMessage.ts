import Message from '../Message'
import Attachment from '../Attachment'
import parseXMAAttachment from '../attachments/parseXMAAttachment'
import parseBlobAttachment from '../attachments/parseBlobAttachment'

export default function parseThreadMessage (threadId: string, message: any) {
  return {
    id: message.message_id,
    timestamp: Number(message.timestamp_precise),
    authorId: message.message_sender ? message.message_sender.messaging_actor.id : '',
    threadId,
    message: message.message ? message.message.text : '',
    attachments: parseAttachments(message),
    stickerId: message.sticker
  } as Message
}
function parseAttachments (message: any): Attachment[] {
  const attachments = message.blob_attachments ? message.blob_attachments.map(parseBlobAttachment) : []
  // const attachments = message.blob_attachments ? message.blob_attachments : []
  const xma = message.extensible_attachment
  if (xma) attachments.push(parseXMAAttachment({ [xma.id]: xma }))
  return attachments
}
