export type EventType = (
  'participantsAddedToGroupThreadEvent' |
  'participantLeftGroupThreadEvent' |
  'threadNameEvent' |
  'addThreadAdminsEvent' |

  'planCreateEvent' |
  'planUpdateTitleEvent' |
  'planUpdateTimeEvent' |
  'planUpdateLocationEvent' |
  'planRsvpEvent' |
  'planDeleteEvent' |

  'pollCreateEvent' |
  'pollUpdateVoteEvent' |

  'changeThreadNicknameEvent' |
  'changeThreadIconEvent' |
  'changeThreadThemeEvent' |

  'deliveryReceiptEvent' |
  'readReceiptEvent' |
  'messageRemoveEvent'
)

export interface Event {
  threadId: string
}

export interface MessageEvent extends Event {
  id: string
  authorId: string
  message: string
}

export {
  ParticipantsAddedToGroupThreadEvent,
  ParticipantLeftGroupThreadEvent,
  ThreadNameEvent,
  AddThreadAdminsEvent
} from './events/ThreadEvents'

export {
  PlanGuest,
  PlanEvent,
  PlanCreateEvent,
  PlanUpdateTitleEvent,
  PlanUpdateTimeEvent,
  PlanUpdateLocationEvent,
  PlanRsvpEvent,
  PlanDeleteEvent
} from './events/PlanEvents'

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
  receiverId: string
}

export interface ReadReceiptEvent extends Event {
  receiverId: string
}

export interface MessageRemoveEvent extends MessageEvent {}
