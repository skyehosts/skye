import type {
  IConversationDto,
  IGetConversationsResponseDto,
} from '@repo/skye-hosts-api-client';

export class ConversationDto implements IConversationDto {
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

export class GetConversationsResponseDto implements IGetConversationsResponseDto {
  conversations: ConversationDto[];
}
