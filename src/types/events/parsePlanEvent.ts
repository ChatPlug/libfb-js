import { getEventMetadata } from './parseDeltaEvent'
import {
    PlanCreateEvent, PlanDeleteEvent, PlanRsvpEvent,
    PlanUpdateLocationEvent,
    PlanUpdateTimeEvent,
    PlanUpdateTitleEvent
} from './PlanEvents'
import { Event, EventType } from '../Events'

export default function parsePlanEvent (delta: any): { type: EventType, event: Event } {
  const { untypedData } = delta
  const event = {
    ...getEventMetadata(delta),
    creatorId: untypedData.event_creator_id,
    title: untypedData.event_title,
    time: new Date(untypedData.event_time * 1000),
    location: untypedData.event_location_name,
    guests: JSON.parse(untypedData.guest_state_list).map(guest => ({
      state: guest.guest_list_state,
      id: guest.node.id
    }))
  }
  if (delta.type === 'lightweight_event_create') {
    return {
      type: 'planCreateEvent',
      event: event as PlanCreateEvent
    }
  }
  if (delta.type === 'lightweight_event_update_title') {
    return {
      type: 'planUpdateTitleEvent',
      event: event as PlanUpdateTitleEvent
    }
  }
  if (delta.type === 'lightweight_event_update_time') {
    return {
      type: 'planUpdateTimeEvent',
      event: event as PlanUpdateTimeEvent
    }
  }
  if (delta.type === 'lightweight_event_update_location') {
    return {
      type: 'planUpdateLocationEvent',
      event: event as PlanUpdateLocationEvent
    }
  }
  if (delta.type === 'lightweight_event_rsvp') {
    return {
      type: 'planRsvpEvent',
      event: {
        ...event,
        guestId: delta.untypedData.guest_id,
        status: delta.untypedData.guest_status
      } as PlanRsvpEvent
    }
  }
  if (delta.type === 'lightweight_event_delete') {
    return {
      type: 'planDeleteEvent',
      event: event as PlanDeleteEvent
    }
  }
}
