import { MessageEvent } from '../Events'

export interface PollOption {
  id: number
  title: string
  voteCount: number
  voters: number[]
  viewerHasVoted: boolean
}

export interface PollEvent extends MessageEvent {
  title: string
  options: PollOption[]
}

export interface PollCreateEvent extends PollEvent {}
export interface PollUpdateVoteEvent extends PollEvent {}
