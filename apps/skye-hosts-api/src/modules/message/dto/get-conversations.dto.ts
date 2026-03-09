import type {
  IConversationDto,
  IGetConversationsResponseDto,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class ConversationDto implements IConversationDto {
  bookingId: number;
  listingTitle: string;
  otherPartyName: string;
  lastMessageContent: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export class GetConversationsResponseDto implements IGetConversationsResponseDto {
  conversations: ConversationDto[];
}
