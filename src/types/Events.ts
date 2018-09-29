export interface ThreadNameEvent {
  id: string
  threadId: number
  authorId: number
  message: string
  name: string
}

export interface DeliveryReceiptEvent {
  threadId: number
  receiverId: number
}

export interface ReadReceiptEvent {
  threadId: number
  receiverId: number
}

export interface ChangeThreadNicknameEvent {
  id: string
  threadId: number
  authorId: number
  message: string
  participantId: number
  nickname: string
}