import parseFileAttachment from './parseFileAttachment'
import parseBlobAttachment from './parseBlobAttachment'
import parseXMAAttachment from './parseXMAAttachment'
import { FileAttachment, XMAAttachment } from '../Attachment'

interface Attachments {
  fileAttachments: FileAttachment[],
  mediaAttachments: XMAAttachment[]
}

export default function parseAttachments (attachments: any[]): Attachments {
  const result: Attachments = {
    fileAttachments: [],
    mediaAttachments: []
  }
  for (let attachment of attachments) {
    if (attachment.mimeType) result.fileAttachments.push(parseFileAttachment(attachment))
    if (attachment.mimetype) result.fileAttachments.push(parseBlobAttachment(attachment))
    if (attachment.xmaGraphQL) result.mediaAttachments.push(parseXMAAttachment(JSON.parse(attachment.xmaGraphQL)))
    result.mediaAttachments.push({
      type: 'Unknown',
      ...attachment
    })
  }
  return result
}
