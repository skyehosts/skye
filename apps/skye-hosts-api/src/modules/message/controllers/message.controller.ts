import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import { NotificationService } from '../../notification/providers';
import {
  GetConversationsResponseDto,
  GetMessagesRequestDto,
  GetMessagesResponseDto,
  MarkMessagesReadRequestDto,
  MarkMessagesReadResponseDto,
  SendMessageRequestDto,
  SendMessageResponseDto,
} from '../dto';
import { MessageGateway } from '../gateways';
import { MessageService } from '../providers';

@Controller('message')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly messageGateway: MessageGateway,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  async onSendMessage(
    @Body() body: SendMessageRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<SendMessageResponseDto> {
    const result = await this.messageService.sendMessage(
      body.bookingId,
      user.sub,
      body.content,
    );

    const senderName = await this.messageService.getSenderName(user.sub);
    const recipientId = await this.messageService.getRecipientId(
      body.bookingId,
      user.sub,
    );

    this.messageGateway.emitNewMessage(
      body.bookingId,
      {
        id: result.id,
        bookingId: result.bookingId,
        senderId: result.senderId,
        senderName,
        content: result.content,
        createdAt: result.createdAt,
      },
      recipientId ? { senderId: user.sub, recipientId } : undefined,
    );

    if (recipientId) {
      await this.notificationService.send({
        recipientAccountId: recipientId,
        eventType: 'message_received',
        title: `New message from ${senderName}`,
        body:
          body.content.length > 100
            ? body.content.slice(0, 100) + '...'
            : body.content,
        data: {
          bookingId: body.bookingId,
          url: `/conversation/${body.bookingId}`,
        },
      });
    }

    return result;
  }

  @Get()
  async onGetMessages(
    @Query() query: GetMessagesRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<GetMessagesResponseDto> {
    return this.messageService.getMessages(
      query.bookingId,
      user.sub,
      query.page,
      query.limit,
    );
  }

  @Patch('read')
  async onMarkMessagesRead(
    @Body() body: MarkMessagesReadRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<MarkMessagesReadResponseDto> {
    const result = await this.messageService.markAsRead(
      body.bookingId,
      user.sub,
    );

    this.messageGateway.emitMessagesRead(body.bookingId, {
      bookingId: body.bookingId,
      readByUserId: user.sub,
      updatedCount: result.updatedCount,
    });

    return result;
  }

  @Get('conversations')
  async onGetConversations(
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<GetConversationsResponseDto> {
    return this.messageService.getConversations(user.sub);
  }
}
