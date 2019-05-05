import { MessageEvent } from '../Events'

export interface PollOption {
  id: string
  title: string
  voteCount: number
  voters: string[]
  viewerHasVoted: boolean
}

export interface PollEvent extends MessageEvent {
  title: string
  options: PollOption[]
}

export interface PollCreateEvent extends PollEvent {}
export interface PollUpdateVoteEvent extends PollEvent {}
