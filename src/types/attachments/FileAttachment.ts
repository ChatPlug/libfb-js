import Attachment from '../Attachment'

interface ImageMetadata {
  width: number
  height: number
  imageSource?: 1 | 2
  renderAsSticker?: number
}
interface VideoMetadata {
  width: number
  height: number
  durationMs: number
  thumbnailUri: string
  source?: 0 | 1
  rotation?: 0 | 1
  loopCount?: number
}
interface AudioMetadata {
  isVoicemail: 0 | 1
  callId: string
  durationMs: number
}
export interface FileAttachment extends Attachment {
  type: 'FileAttachment' | 'ImageAttachment' | 'VideoAttachment' | 'AudioAttachment'
  id: string
  mimeType: string
  filename: string
  url?: string
  size?: number
}
export interface ImageAttachment extends FileAttachment {
  type: 'ImageAttachment'
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif'
  metadata: ImageMetadata
}
export interface VideoAttachment extends FileAttachment {
  type: 'VideoAttachment'
  mimeType: 'video/mp4'
  metadata: VideoMetadata
}
export interface AudioAttachment extends FileAttachment {
  type: 'AudioAttachment'
  mimeType: 'audio/mpeg' | 'audio/aac'
  metadata: AudioMetadata
}
