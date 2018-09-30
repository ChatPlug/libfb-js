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

export interface DeliveryReceiptEvent extends Event {
  receiverId: number
}

export interface ReadReceiptEvent extends Event {
  receiverId: number
}