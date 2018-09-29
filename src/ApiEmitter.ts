import { EventEmitter } from "events"
import Message from "./types/Message"
import { ThreadNameEvent, DeliveryReceiptEvent, ReadReceiptEvent, ChangeThreadNicknameEvent } from "./types/Events"
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
        attachments: [],
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
        id: delta.messageMetadata.messageId,
        threadId: this.getThreadId(delta),
        authorId: delta.messageMetadata.actorFbId,
        message: delta.messageMetadata.adminText,
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
    }

    if (event.deltaReadReceipt) {
      const delta = event.deltaReadReceipt

      const readReceiptEvent = {
        threadId: this.getThreadId(delta),
        receiverId: delta.actorFbId || this.getThreadId(delta)
      } as ReadReceiptEvent

      this.emit("readReceiptEvent", readReceiptEvent)
    }

    if (event.deltaAdminTextMessage) {
      const delta = event.deltaAdminTextMessage

      switch (delta.type) {
        case 'change_thread_nickname':
          const changeThreadNicknameEvent = {
            id: delta.messageMetadata.messageId,
            threadId: this.getThreadId(delta),
            authorId: delta.messageMetadata.actorFbId,
            message: delta.messageMetadata.adminText,
            participantId: delta.untypedData.participant_id,
            nickname: delta.untypedData.nickname
          } as ChangeThreadNicknameEvent
          this.emit('changeThreadNicknameEvent', changeThreadNicknameEvent)
          break
      }
    }
  }

  private getThreadId (delta: any) {
      const { threadKey } = delta.messageMetadata || delta
      return threadKey.threadFbId || threadKey.otherUserFbId
  }
}