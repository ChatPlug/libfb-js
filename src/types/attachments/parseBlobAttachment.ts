import { AudioAttachment, FileAttachment, ImageAttachment, VideoAttachment } from './FileAttachment'

export default function parseBlobAttachment (attachment: any) {
  const type = attachment.__type__.name

  const metadata: { id: string, mimeType: string, filename: string, size: number } = {
    id: attachment.attachment_fbid,
    mimeType: attachment.mimetype,
    filename: attachment.filename,
    size: attachment.filesize
  }
  const dimensions = () => ({
    width: attachment.original_dimensions.x,
    height: attachment.original_dimensions.y
  })

  if (type === 'MessageVideo') {
    return {
      type: 'VideoAttachment',
      ...metadata,
      url: attachment.video_url,
      metadata: {
        ...dimensions(),
        durationMs: attachment.playable_duration_in_ms,
        thumbnailUri: attachment.streamingImageThumbnail.uri,
        rotation: attachment.rotation
      }
    } as VideoAttachment
  }
  if (type === 'MessageImage') {
    return {
      type: 'ImageAttachment',
      ...metadata,
      url: attachment.image_full_screen.uri,
      metadata: dimensions()
    } as ImageAttachment
  }
  if (type === 'MessageAnimatedImage') {
    return {
      type: 'ImageAttachment',
      ...metadata,
      url: attachment.animated_image_full_screen.uri,
      metadata: {
        width: attachment.animated_image_original_dimensions.x,
        height: attachment.animated_image_original_dimensions.y
      }
    } as ImageAttachment
  }
  if (type === 'MessageAudio') {
    return {
      type: 'AudioAttachment',
      ...metadata,
      metadata: {
        durationMs: attachment.playable_duration_in_ms,
        isVoicemail: 0,
        callId: ''
      }
    } as AudioAttachment
  }
  if (type === 'MessageFile') {
    return {
      type: 'FileAttachment',
      ...metadata
    } as FileAttachment
  }
  return attachment
}
