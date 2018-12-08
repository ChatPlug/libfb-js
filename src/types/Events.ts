interface Event {
  threadId: number
}

export interface MessageEvent extends Event {
  id: string
  authorId: number
  message: string
}

export {
  ParticipantsAddedToGroupThreadEvent,
  ParticipantLeftGroupThreadEvent,
  ThreadNameEvent,
  ChangeThreadNicknameEvent,
  AddThreadAdminsEvent
} from './events/ThreadEvents'

export {
  FacebookEventGuest,
  FacebookEvent,
  EventCreateEvent,
  EventUpdateTitleEvent,
  EventUpdateTimeEvent,
  EventUpdateLocationEvent,
  EventRsvpEvent,
  EventDeleteEvent
} from './events/FacebookEvents'

export interface DeliveryReceiptEvent extends Event {
  receiverId: number
}

export interface ReadReceiptEvent extends Event {
  receiverId: number
}