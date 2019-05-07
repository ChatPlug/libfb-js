import parseFileAttachment from './parseFileAttachment'
import parseBlobAttachment from './parseBlobAttachment'
import parseXMAAttachment from './parseXMAAttachment'
import Attachment from '../Attachment'

export default function parseAttachment (attachment: any): Attachment {
  if (attachment.mimeType) return parseFileAttachment(attachment)
  if (attachment.mimetype) return parseBlobAttachment(attachment)
  if (attachment.xmaGraphQL) return parseXMAAttachment(JSON.parse(attachment.xmaGraphQL))
  return {
    type: 'Unknown',
    ...attachment
  }
}
