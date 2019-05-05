export default interface Attachment {
  type: string
}
export * from './attachments/XMAAttachment'
export * from './attachments/FileAttachment'
export { default as parseAttachment } from './attachments/parseAttachment'
