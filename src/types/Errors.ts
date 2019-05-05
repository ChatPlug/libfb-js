export class AuthAPIError extends Error {
  code?: number
  errorData?: any
  requestArgs?: any
}
export class UploadAPIError extends Error {
  debugInfo: {
    retriable: boolean
    type: string
    message: string
  }
  constructor (debugInfo) {
    super('Error occured while uploading')
    this.debugInfo = debugInfo
  }
}
export class APIError extends Error {
  details: any
  constructor (status, details) {
    super(status)
    this.details = details
  }
}
export class AttachmentNotFoundError extends Error {
  path: string
  constructor (path) {
    super('Attachment not found!')
    this.path = path
  }
}
export class AttachmentURLMissingError extends Error {
  attachment: any
  constructor (attachment) {
    super('Attachment URL missing!')
    this.attachment = attachment
  }
}
