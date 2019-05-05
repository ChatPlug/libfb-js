import { MessageEvent } from '../Events'

export interface ParticipantsAddedToGroupThreadEvent extends MessageEvent {
  participantIds: string[]
}

export interface ParticipantLeftGroupThreadEvent extends MessageEvent {
  participantId: string
}

export interface ThreadNameEvent extends MessageEvent {
  name: string
}

export interface AddThreadAdminsEvent extends MessageEvent {
  participantId: string
}
