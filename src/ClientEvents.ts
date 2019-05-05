import Message from './types/Message'
import {
  Event,
  ParticipantsAddedToGroupThreadEvent,
  ParticipantLeftGroupThreadEvent,
  ThreadNameEvent,
  AddThreadAdminsEvent,
  PlanCreateEvent,
  PlanUpdateTitleEvent,
  PlanUpdateTimeEvent,
  PlanUpdateLocationEvent,
  PlanRsvpEvent,
  PlanDeleteEvent,
  PollCreateEvent,
  PollUpdateVoteEvent,
  ChangeThreadNicknameEvent,
  ChangeThreadIconEvent,
  ChangeThreadThemeEvent,
  DeliveryReceiptEvent,
  ReadReceiptEvent,
  EventType
} from './types/Events'

export default interface ClientEvents {
  message: (message: Message) => void,
  event: (event: { type: EventType, event: Event }) => void,

  participantsAddedToGroupThreadEvent: (participantsAddedToGroupThreadEvent: ParticipantsAddedToGroupThreadEvent) => void,
  participantLeftGroupThreadEvent: (participantLeftGroupThreadEvent: ParticipantLeftGroupThreadEvent) => void,
  threadNameEvent: (threadNameEvent: ThreadNameEvent) => void,
  addThreadAdminsEvent: (addThreadAdminsEvent: AddThreadAdminsEvent) => void,

  planCreateEvent: (planCreateEvent: PlanCreateEvent) => void,
  planUpdateTitleEvent: (planUpdateTitleEvent: PlanUpdateTitleEvent) => void,
  planUpdateTimeEvent: (planUpdateTimeEvent: PlanUpdateTimeEvent) => void,
  planUpdateLocationEvent: (planUpdateLocationEvent: PlanUpdateLocationEvent) => void,
  planRsvpEvent: (planRsvpEvent: PlanRsvpEvent) => void,
  planDeleteEvent: (planDeleteEvent: PlanDeleteEvent) => void,

  pollCreateEvent: (pollCreateEvent: PollCreateEvent) => void,
  pollUpdateVoteEvent: (pollUpdateVoteEvent: PollUpdateVoteEvent) => void,

  changeThreadNicknameEvent: (changeThreadNicknameEvent: ChangeThreadNicknameEvent) => void,
  changeThreadIconEvent: (changeThreadIconEvent: ChangeThreadIconEvent) => void,
  changeThreadThemeEvent: (changeThreadThemeEvent: ChangeThreadThemeEvent) => void,

  deliveryReceiptEvent: (deliveryReceiptEvent: DeliveryReceiptEvent) => void,
  readReceiptEvent: (readReceiptEvent: ReadReceiptEvent) => void
}
