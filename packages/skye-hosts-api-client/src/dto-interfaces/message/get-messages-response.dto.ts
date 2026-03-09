export interface IMessageDto {
  id: number;
  bookingId: number;
  senderId: number;
  senderName: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface IGetMessagesResponseDto {
  messages: IMessageDto[];
  total: number;
  page: number;
  limit: number;
}
