import { EventEmitter } from "events"
import Message from "./types/Message"
import {
  ThreadNameEvent,
  DeliveryReceiptEvent,
  ReadReceiptEvent,
  ChangeThreadNicknameEvent,
  AddThreadAdminsEvent,
  ParticipantsAddedToGroupThreadEvent,
  ParticipantLeftGroupThreadEvent,
  EventCreateEvent,
  EventDeleteEvent,
  EventUpdateLocationEvent,
  EventUpdateTimeEvent,
  EventUpdateTitleEvent,
  EventRsvpEvent,
  PollCreateEvent,
  PollUpdateVoteEvent
} from "./types/Events"
import { FacebookApiOptions } from './FacebookApi'
import Session from './types/Session'
export default class ApiEmitter extends EventEmitter {
  options: FacebookApiOptions
  session: Session

  constructor(options: FacebookApiOptions, session: Session) {
    super()
    this.options = options
    this.session = session
  }

  handleMessage(event: any) {
    if (event.deltaNewMessage) {
      const delta = event.deltaNewMessage
      const message = {
        threadId: this.getThreadId(delta),
        attachments: delta.attachments,
        authorId: delta.messageMetadata.actorFbId,
        id: delta.messageMetadata.messageId,
        timestamp: delta.messageMetadata.timestamp,
        message: delta.body || "",
        stickerId: delta.stickerId
      } as Message
      if (message.authorId === this.session.tokens.uid && !this.options.selfListen) return
      this.emit("message", message)
      return
    }

    if (event.deltaThreadName) {
      const delta = event.deltaThreadName
      const threadNameEvent = {
        ...this.getEventMetadata(delta),
        name: delta.name
      } as ThreadNameEvent
      this.emit("threadNameEvent", threadNameEvent)
      this.emit("event", { event: threadNameEvent, type: "threadNameEvent" })
      return
    }

    if (event.deltaDeliveryReceipt) {
      const delta = event.deltaDeliveryReceipt
      const deliveryReceiptEvent = {
        threadId: this.getThreadId(delta),
        receiverId: delta.actorFbId || this.getThreadId(delta)
      } as DeliveryReceiptEvent
      this.emit("deliveryReceiptEvent", deliveryReceiptEvent)
      this.emit("event", { event: deliveryReceiptEvent, type: "deliveryReceiptEvent" })
      return
    }

    if (event.deltaReadReceipt) {
      const delta = event.deltaReadReceipt
      const readReceiptEvent = {
        threadId: this.getThreadId(delta),
        receiverId: delta.actorFbId || this.getThreadId(delta)
      } as ReadReceiptEvent
      this.emit("readReceiptEvent", readReceiptEvent)
      this.emit("event", { event: readReceiptEvent, type: "readReceiptEvent" })
      return
    }

    if (event.deltaParticipantsAddedToGroupThread) {
      const delta = event.deltaParticipantsAddedToGroupThread
      const participantsAddedToGroupThreadEvent = {
        ...this.getEventMetadata(delta),
        participantIds: delta.addedParticipants.map(user => user.userFbId)
      } as ParticipantsAddedToGroupThreadEvent
      this.emit('participantsAddedToGroupThreadEvent', participantsAddedToGroupThreadEvent)
      this.emit("event", { event: participantsAddedToGroupThreadEvent, type: "participantsAddedToGroupThreadEvent" })
      return
    }

    if (event.deltaParticipantLeftGroupThread) {
      const delta = event.deltaParticipantLeftGroupThread
      const participantLeftGroupThreadEvent = {
        ...this.getEventMetadata(delta),
        participantId: delta.leftParticipantFbId
      } as ParticipantLeftGroupThreadEvent
      this.emit('participantLeftGroupThreadEvent', participantLeftGroupThreadEvent)
      this.emit("event", { event: participantLeftGroupThreadEvent, type: "participantLeftGroupThreadEvent" })
      return
    }

    if (event.deltaAdminTextMessage) {
      const delta = event.deltaAdminTextMessage
      switch (delta.type) {

        case 'change_thread_nickname':
          const changeThreadNicknameEvent = {
            ...this.getEventMetadata(delta),
            participantId: delta.untypedData.participant_id,
            nickname: delta.untypedData.nickname
          } as ChangeThreadNicknameEvent
          this.emit('changeThreadNicknameEvent', changeThreadNicknameEvent)
          this.emit("event", { event: changeThreadNicknameEvent, type: "changeThreadNicknameEvent" })
          break

        case 'change_thread_admins':
          const addThreadAdminsEvent = {
            ...this.getEventMetadata(delta),
            participantId: delta.untypedData.TARGET_ID
          } as AddThreadAdminsEvent
          this.emit('addThreadAdminsEvent', addThreadAdminsEvent)
          this.emit("event", { event: addThreadAdminsEvent, type: "addThreadAdminsEvent" })
          break

        case 'lightweight_event_create':
          const eventCreateEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData)
          } as EventCreateEvent
          this.emit('eventCreateEvent', eventCreateEvent)
          this.emit("event", { event: eventCreateEvent, type: "eventCreateEvent" })
          break

        case 'lightweight_event_update_title':
          const eventUpdateTitleEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData)
          } as EventUpdateTitleEvent
          this.emit('eventUpdateTitleEvent', eventUpdateTitleEvent)
          this.emit("event", { event: eventUpdateTitleEvent, type: "eventUpdateTitleEvent" })
          break

        case 'lightweight_event_update_time':
          const eventUpdateTimeEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData)
          } as EventUpdateTimeEvent
          this.emit('eventUpdateTimeEvent', eventUpdateTimeEvent)
          this.emit("event", { event: eventUpdateTimeEvent, type: "eventUpdateTimeEvent" })
          break

        case 'lightweight_event_update_location':
          const eventUpdateLocationEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData)
          } as EventUpdateLocationEvent
          this.emit('eventUpdateLocationEvent', eventUpdateLocationEvent)
          this.emit("event", { event: eventUpdateLocationEvent, type: "eventUpdateLocationEvent" })
          break

        case 'lightweight_event_rsvp':
          const eventRsvpEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData),
            guestId: Number(delta.untypedData.guest_id),
            status: delta.untypedData.guest_status
          } as EventRsvpEvent
          this.emit('eventRsvpEvent', eventRsvpEvent)
          this.emit("event", { event: eventRsvpEvent, type: "eventRsvpEvent" })
          break

        case 'lightweight_event_delete':
          const eventDeleteEvent = {
            ...this.getEventMetadata(delta),
            ...this.getFacebookEventMetadata(delta.untypedData)
          } as EventDeleteEvent
          this.emit('eventDeleteEvent', eventDeleteEvent)
          this.emit("event", { event: eventDeleteEvent, type: "eventDeleteEvent" })
          break

        case 'group_poll':
          switch (delta.untypedData.event_type) {
            case 'question_creation':
              const pollCreateEvent = {
                ...this.getEventMetadata(delta),
                ...this.getPollMetadata(delta.untypedData)
              } as PollCreateEvent
              this.emit('pollCreateEvent', pollCreateEvent)
              this.emit("event", { event: pollCreateEvent, type: "pollCreateEvent" })
              break
            case 'update_vote':
              const pollUpdateVoteEvent = {
                ...this.getEventMetadata(delta),
                ...this.getPollMetadata(delta.untypedData)
              } as PollUpdateVoteEvent
              this.emit('pollUpdateVoteEvent', pollUpdateVoteEvent)
              this.emit("event", { event: pollUpdateVoteEvent, type: "pollUpdateVoteEvent" })
              break
          }
          break
      }
    }
  }

  private getEventMetadata (delta: any) {
    return {
      id: delta.messageMetadata.messageId,
      threadId: this.getThreadId(delta),
      authorId: delta.messageMetadata.actorFbId,
      message: delta.messageMetadata.adminText
    }
  }

  private getThreadId (delta: any) {
      const { threadKey } = delta.messageMetadata || delta
      return threadKey.threadFbId || threadKey.otherUserFbId
  }

  private getFacebookEventMetadata (untypedData: any) {
    return {
      creatorId: Number(untypedData.event_creator_id),
      title: untypedData.event_title,
      time: new Date(untypedData.event_time * 1000),
      location: untypedData.event_location_name,
      guests: JSON.parse(untypedData.guest_state_list).map(guest => ({
        state: guest.guest_list_state,
        id: guest.node.id
      }))
    }
  }

  private getPollMetadata (untypedData: any) {
    let question = JSON.parse(untypedData.question_json)
    return {
      title: question.text,
      options: question.options.map(option => ({
        id: Number(option.id),
        title: option.text,
        voteCount: option.total_count,
        voters: option.voters.map(Number),
        viewerHasVoted: option.viewer_has_voted === 'true'
      }))
    }
  }
}