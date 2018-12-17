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

export {
  PollOption,
  PollEvent,
  PollCreateEvent,
  PollUpdateVoteEvent
} from './events/PollEvents'

export {
  ChangeThreadNicknameEvent,
  ChangeThreadIconEvent,
  ChangeThreadThemeEvent
} from './events/ThreadCustomizationEvents'

export interface DeliveryReceiptEvent extends Event {
  receiverId: number
}

export interface ReadReceiptEvent extends Event {
  receiverId: number
}