import { MessageEvent } from '../Events'

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