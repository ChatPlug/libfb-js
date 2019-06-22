import Attachment from '../Attachment'

// XMA - ExtensibleMessageAttachment
export interface XMAAttachment extends Attachment {
  type: (
    'UnavailableXMA' |
    'StoryXMA' |
    'ExternalUrlXMA' |
    'AdvertXMA' |
    'EventReminderXMA' |
    'LeaderboardUpdateXMA' |
    'LiveLocationXMA' |
    'LocationXMA' |
    'GroupXMA' |
    'LightweightActionXMA' |
    'PageXMA' |
    'ProductXMA' |
    'MontageXMA' |
    'InstagramXMA'
  )
  message?: string
  description?: string
  url?: string
  imageURL?: string
}
export interface UnavailableXMA extends XMAAttachment {
  type: 'UnavailableXMA'
  message: string
  attach: any
}
export interface StoryXMA extends XMAAttachment {
  type: 'StoryXMA'
  url: string
}
export interface ExternalUrlXMA extends XMAAttachment {
  type: 'ExternalUrlXMA'
  url: string
}
export interface AdvertXMA extends XMAAttachment {
  type: 'AdvertXMA'
  message: string
  url?: string
}
export interface EventReminderXMA extends XMAAttachment {
  type: 'EventReminderXMA'
  message: string
  description: string
}
export interface LeaderboardUpdateXMA extends XMAAttachment {
  type: 'LeaderboardUpdateXMA'
  message: string
  imageURL: string
}
export interface LiveLocationXMA extends XMAAttachment {
  type: 'LiveLocationXMA'
  url: string
}
export interface LocationXMA extends XMAAttachment {
  type: 'LocationXMA'
  url: string
}
export interface GroupXMA extends XMAAttachment {
  type: 'GroupXMA'
  url: string
}
export interface LightweightActionXMA extends XMAAttachment {
  type: 'LightweightActionXMA'
  message: string
}
export interface PageXMA extends XMAAttachment {
  type: 'PageXMA'
  url: string
}
export interface ProductXMA extends XMAAttachment {
  type: 'ProductXMA'
  url: string
}
export interface MontageXMA extends XMAAttachment {
  type: 'MontageXMA'
}
export interface InstagramXMA extends XMAAttachment {
  type: 'InstagramXMA'
  url: string
}
