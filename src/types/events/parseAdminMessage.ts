import { ChangeThreadIconEvent, ChangeThreadNicknameEvent, ChangeThreadThemeEvent } from './ThreadCustomizationEvents'
import { AddThreadAdminsEvent } from './ThreadEvents'
import { getEventMetadata } from './parseDeltaEvent'
import parsePollEvent from './parsePollEvent'
import parsePlanEvent from './parsePlanEvent'
import { Event, EventType } from '../Events'

export default function parseAdminMessage (delta: any): { type: EventType, event: Event } {
  if (delta.type.startsWith('lightweight_event_')) return parsePlanEvent(delta)
  if (delta.type === 'group_poll') return parsePollEvent(delta)

  if (delta.type === 'change_thread_nickname') {
    return {
      type: 'changeThreadNicknameEvent',
      event: {
        ...getEventMetadata(delta),
        participantId: delta.untypedData.participant_id,
        nickname: delta.untypedData.nickname
      } as ChangeThreadNicknameEvent
    }
  }
  if (delta.type === 'change_thread_admins') {
    return {
      type: 'addThreadAdminsEvent',
      event: {
        ...this.getEventMetadata(delta),
        participantId: delta.untypedData.TARGET_ID
      } as AddThreadAdminsEvent
    }
  }
  if (delta.type === 'change_thread_icon') {
    return {
      type: 'changeThreadIconEvent',
      event: {
        ...getEventMetadata(delta),
        threadIcon: delta.untypedData.thread_icon,
        threadIconURL: delta.untypedData.thread_icon_url
      } as ChangeThreadIconEvent
    }
  }
  if (delta.type === 'change_thread_theme') {
    return {
      type: 'changeThreadThemeEvent',
      event: {
        ...getEventMetadata(delta),
        color: delta.untypedData.theme_color
      } as ChangeThreadThemeEvent
    }
  }
}
