import { MessageEvent } from '../Events'

export interface PlanGuest {
  state: string
  id: string
}

export interface PlanEvent extends MessageEvent {
  creatorId: string
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
  guestId: string
  status: string
}
export interface PlanDeleteEvent extends PlanEvent {}
