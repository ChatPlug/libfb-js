import { AudioAttachment, FileAttachment, ImageAttachment, VideoAttachment } from './FileAttachment'

export default function parseFileAttachment (attachment: any) {
  const attach = {
    type: 'FileAttachment',
    id: attachment.id,
    mimeType: attachment.mimeType,
    filename: attachment.filename,
    size: attachment.fileSize
  } as FileAttachment

  if (['image/jpeg', 'image/png', 'image/gif'].includes(attachment.mimeType)) {
    return {
      ...attach,
      type: 'ImageAttachment',
      url: attachment.imageMetadata.rawImageURI,
      metadata: attachment.imageMetadata
    } as ImageAttachment
  }
  if (attachment.mimeType === 'video/mp4') {
    return {
      ...attach,
      type: 'VideoAttachment',
      url: attachment.videoMetadata.videoUri,
      metadata: attachment.videoMetadata
    } as VideoAttachment
  }
  if (['audio/mpeg', 'audio/aac'].includes(attachment.mimeType)) {
    return {
      ...attach,
      type: 'AudioAttachment',
      metadata: attachment.audioMetadata
    } as AudioAttachment
  }
  return attach
}
