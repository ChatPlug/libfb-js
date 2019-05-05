import { MessageEvent } from '../Events'

export interface PlanGuest {
  state: string
  id: number
}

export interface PlanEvent extends MessageEvent {
  creatorId: number
  title: string
  time: Date
  location: string
  guests: PlanGuest[]
}

export interface PlanCreateEvent extends PlanEvent {}
export interface PlanUpdateTitleEvent extends PlanEvent {}
export interface PlanUpdateTimeEvent extends PlanEvent {}
export interface PlanUpdateLocationEvent extends PlanEvent {}
export interface PlanRsvpEvent extends PlanEvent {
  guestId: number
  status: string
}
export interface PlanDeleteEvent extends PlanEvent {}
