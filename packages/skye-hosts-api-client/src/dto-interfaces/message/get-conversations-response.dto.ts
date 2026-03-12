export interface IConversationDto {
  bookingId: number;
  listingTitle: string;
  otherPartyName: string;
  lastMessageContent: string;
  lastMessageAt: Date;
  unreadCount: number;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
}

export interface IGetConversationsResponseDto {
  conversations: IConversationDto[];
}
