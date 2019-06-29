import {
    AdvertXMA,
    EventReminderXMA,
    ExternalUrlXMA, GroupXMA, InstagramXMA,
    LeaderboardUpdateXMA, LightweightActionXMA, LiveLocationXMA, LocationXMA, MontageXMA, PageXMA, ProductXMA,
    StoryXMA,
    UnavailableXMA
} from './XMAAttachment'
import { parse } from 'url'
import vm from 'vm'

export default function parseXMAAttachment (xma: any) {
  const attach = xma[Object.keys(xma)[0]].story_attachment
  if (!attach.target || !attach.target.__type__) {
    return {
      type: 'UnavailableXMA',
      message: attach.description ? attach.description.text : 'Attachment unavailable',
      attach: xma
    } as UnavailableXMA
  }
  const type = attach.target.__type__.name
  if (type === 'Story') {
    return {
      type: 'StoryXMA',
      url: attach.url
    } as StoryXMA
  }
  if (type === 'ExternalUrl') {
    return {
      type: 'ExternalUrlXMA',
      url: cleanURL(attach.url)
    } as ExternalUrlXMA
  }
  if (type === 'MessengerBusinessMessage') {
    return {
      type: 'AdvertXMA',
      message: attach.title,
      url: attach.url ? cleanURL(attach.url) : null
    } as AdvertXMA
  }
  if (type === 'MessengerEventReminder') {
    return {
      type: 'EventReminderXMA',
      message: attach.title,
      description: attach.description.text
    } as EventReminderXMA
  }
  if (type === 'InstantGamesLeaderboardUpdateStoryAttachment') {
    return {
      type: 'LeaderboardUpdateXMA',
      message: attach.title,
      imageURL: attach.subattachments.filter(a => a.media && a.media.__type__.name === 'BestEffortImageAttachmentMedia')[0].media.image.uri
    } as LeaderboardUpdateXMA
  }
  if (type === 'MessageLiveLocation') {
    return {
      type: 'LiveLocationXMA',
      url: cleanURL(attach.url)
    } as LiveLocationXMA
  }
  if (type === 'MessageLocation') {
    return {
      type: 'LocationXMA',
      url: cleanURL(attach.url)
    } as LocationXMA
  }
  if (type === 'Group') {
    return {
      type: 'GroupXMA',
      url: attach.url
    } as GroupXMA
  }
  if (type === 'LightweightAction') {
    return {
      type: 'LightweightActionXMA',
      message: attach.title
    } as LightweightActionXMA
  }
  if (type === 'Page') {
    return {
      type: 'PageXMA',
      url: attach.url
    } as PageXMA

  }
  if (type === 'GroupCommerceProductItem') {
    return {
      type: 'ProductXMA',
      url: attach.url
    } as ProductXMA
  }
  if (type === 'MontageShare') {
    return {
      type: 'MontageXMA'
    } as MontageXMA
  }
  if (type === 'InstagramMediaAttachmentLink') {
    return {
      type: 'InstagramXMA',
      url: attach.url
    } as InstagramXMA
  }
}
function cleanURL (url) {
  const { query } = parse(url, true)
  if (url.startsWith('https:\\/\\/')) return cleanURL(vm.runInContext(url, vm.createContext()))
  if (url.startsWith('fbrpc:')) return cleanURL(query.target_url)
  if (url.includes('l.facebook.com/l.php')) return cleanURL(query.u)
  if (url.match(/http[s]?:\/\/(www.)?google\.[a-z.]{2,7}\/url\?/)) return cleanURL(query.url)
  return url
}
