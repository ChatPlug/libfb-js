import { MessageEvent } from '../Events'

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
