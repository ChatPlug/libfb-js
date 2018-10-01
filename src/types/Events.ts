interface Event {
  threadId: number
}

interface MessageEvent extends Event {
  id: string
  authorId: number
  message: string
}

export interface ParticipantsAddedToGroupThreadEvent extends MessageEvent {
  participantIds: number[]
}

export interface ParticipantLeftGroupThreadEvent extends MessageEvent {
  participantId: number
}

export interface ThreadNameEvent extends MessageEvent {
  name: string
}

export interface ChangeThreadNicknameEvent extends MessageEvent {
  participantId: number
  nickname: string
}

export interface AddThreadAdminsEvent extends MessageEvent {
  participantId: number
}

export interface FacebookEventGuest {
  state: string
  id: number
}

export interface FacebookEvent extends MessageEvent {
  creatorId: number
  title: string
  time: Date
  location: string
  guests: FacebookEventGuest[]
}

export interface EventCreateEvent extends FacebookEvent {}
export interface EventUpdateTitleEvent extends FacebookEvent {}
export interface EventUpdateTimeEvent extends FacebookEvent {}
export interface EventUpdateLocationEvent extends FacebookEvent {}
export interface EventRsvpEvent extends FacebookEvent {
  guestId: number
  status: string
}
export interface EventDeleteEvent extends FacebookEvent {}

export interface DeliveryReceiptEvent extends Event {
  receiverId: number
}

export interface ReadReceiptEvent extends Event {
  receiverId: number
}