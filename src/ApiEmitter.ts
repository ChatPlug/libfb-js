import { EventEmitter } from "events"
import Message from "./types/Message"
import { ThreadNameEvent, DeliveryReceiptEvent, ReadReceiptEvent, ChangeThreadNicknameEvent, AddThreadAdminsEvent, ParticipantsAddedToGroupThreadEvent, ParticipantLeftGroupThreadEvent } from "./types/Events"
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
        message: delta.body || ""
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
      return
    }

    if (event.deltaDeliveryReceipt) {
      const delta = event.deltaDeliveryReceipt
      const deliveryReceiptEvent = {
        threadId: this.getThreadId(delta),
        receiverId: delta.actorFbId || this.getThreadId(delta)
      } as DeliveryReceiptEvent
      this.emit("deliveryReceiptEvent", deliveryReceiptEvent)
      return
    }

    if (event.deltaReadReceipt) {
      const delta = event.deltaReadReceipt
      const readReceiptEvent = {
        threadId: this.getThreadId(delta),
        receiverId: delta.actorFbId || this.getThreadId(delta)
      } as ReadReceiptEvent
      this.emit("readReceiptEvent", readReceiptEvent)
      return
    }

    if (event.deltaParticipantsAddedToGroupThread) {
      const delta = event.deltaParticipantsAddedToGroupThread
      const participantsAddedToGroupThreadEvent = {
        ...this.getEventMetadata(delta),
        participantIds: delta.addedParticipants.map(user => user.userFbId)
      } as ParticipantsAddedToGroupThreadEvent
      this.emit('participantsAddedToGroupThreadEvent', participantsAddedToGroupThreadEvent)
      return
    }

    if (event.deltaParticipantLeftGroupThread) {
      const delta = event.deltaParticipantLeftGroupThread
      const participantLeftGroupThreadEvent = {
        ...this.getEventMetadata(delta),
        participantId: delta.leftParticipantFbId
      } as ParticipantLeftGroupThreadEvent
      this.emit('participantLeftGroupThreadEvent', participantLeftGroupThreadEvent)
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
          break

        case 'change_thread_admins':
          const addThreadAdminsEvent = {
            ...this.getEventMetadata(delta),
            participantId: delta.untypedData.TARGET_ID
          } as AddThreadAdminsEvent
          this.emit('addThreadAdminsEvent', addThreadAdminsEvent)
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
}