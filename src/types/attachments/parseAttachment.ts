import parseFileAttachment from './parseFileAttachment'
import parseBlobAttachment from './parseBlobAttachment'
import parseXMAAttachment from './parseXMAAttachment'

export default function parseAttachment (attachment: any) {
  if (attachment.mimeType) parseFileAttachment(attachment)
  if (attachment.mimetype) parseBlobAttachment(attachment)
  if (attachment.xmaGraphQL) parseXMAAttachment(JSON.parse(attachment.xmaGraphQL))
}
