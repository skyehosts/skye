export interface IConversationDto {
  bookingId: number;
  listingTitle: string;
  otherPartyName: string;
  lastMessageContent: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface IGetConversationsResponseDto {
  conversations: IConversationDto[];
}
