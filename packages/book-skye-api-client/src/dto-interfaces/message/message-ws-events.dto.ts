export interface IWsNewMessageEvent {
  id: number;
  bookingId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface IWsMessageReadEvent {
  bookingId: number;
  readByUserId: number;
  updatedCount: number;
}
