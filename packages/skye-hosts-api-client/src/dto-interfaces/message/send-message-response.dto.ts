export interface ISendMessageResponseDto {
  id: number;
  bookingId: number;
  senderId: number;
  content: string;
  createdAt: Date;
}
