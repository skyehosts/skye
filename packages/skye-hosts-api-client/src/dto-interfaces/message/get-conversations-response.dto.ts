export interface IConversationDto {
  bookingId: number;
  listingTitle: string;
  otherPartyName: string;
  lastMessageContent: string;
  lastMessageAt: Date;
  unreadCount: number;
  checkInAt: Date;
  checkOutAt: Date;
  bookingStatus: string;
}

export interface IGetConversationsResponseDto {
  conversations: IConversationDto[];
}
