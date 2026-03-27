import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import { ConfigService } from '../../config/providers/config.service';
import { MessageService } from '../providers';

@WebSocketGateway({ namespace: '/messaging', cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessageGateway.name);

  private readonly jwtSecret: string;

  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getAll().jwtSecret;
  }

  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.warn('Client connected without token, disconnecting');
        client.disconnect();
        return;
      }

      const claims = jwt.verify(token, this.jwtSecret) as unknown as IJwtClaims;
      client.data.userId = claims.sub;
      client.data.userName = claims.name;
      void client.join(`user:${claims.sub}`);
      this.logger.debug(`Client connected: userId=${claims.sub}`);
    } catch {
      this.logger.warn('Client connected with invalid token, disconnecting');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: userId=${client.data.userId}`);
  }

  @SubscribeMessage('joinBooking')
  async handleJoinBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.messageService.validateBookingAccess(
        data.bookingId,
        client.data.userId,
      );
      const room = `booking:${data.bookingId}`;
      await client.join(room);
      this.logger.debug(`User ${client.data.userId} joined room ${room}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage('leaveBooking')
  async handleLeaveBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ): Promise<{ success: boolean }> {
    const room = `booking:${data.bookingId}`;
    await client.leave(room);
    this.logger.debug(`User ${client.data.userId} left room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number; content: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.messageService.sendMessage(
        data.bookingId,
        client.data.userId,
        data.content,
      );

      const senderName = await this.messageService.getSenderName(
        client.data.userId,
      );

      const messagePayload = {
        id: result.id,
        bookingId: result.bookingId,
        senderId: result.senderId,
        senderName,
        content: result.content,
        createdAt: result.createdAt,
      };

      // Emit to booking room (for open conversation screens)
      const room = `booking:${data.bookingId}`;
      this.server.to(room).emit('newMessage', messagePayload);

      // Also emit to both participants' user rooms (for conversation list screens)
      const recipientId = await this.messageService.getRecipientId(
        data.bookingId,
        client.data.userId,
      );
      this.server
        .to(`user:${client.data.userId}`)
        .to(`user:${recipientId}`)
        .emit('newMessage', messagePayload);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.messageService.markAsRead(
        data.bookingId,
        client.data.userId,
      );

      const room = `booking:${data.bookingId}`;
      this.server.to(room).emit('messagesRead', {
        bookingId: data.bookingId,
        readByUserId: client.data.userId,
        updatedCount: result.updatedCount,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  emitNewMessage(
    bookingId: number,
    payload: {
      id: number;
      bookingId: number;
      senderId: number;
      senderName: string;
      content: string;
      createdAt: Date;
    },
    participantIds?: { senderId: number; recipientId: number },
  ): void {
    const room = `booking:${bookingId}`;
    this.server.to(room).emit('newMessage', payload);

    if (participantIds) {
      this.server
        .to(`user:${participantIds.senderId}`)
        .to(`user:${participantIds.recipientId}`)
        .emit('newMessage', payload);
    }
  }

  emitMessagesRead(
    bookingId: number,
    payload: {
      bookingId: number;
      readByUserId: number;
      updatedCount: number;
    },
  ): void {
    const room = `booking:${bookingId}`;
    this.server.to(room).emit('messagesRead', payload);
  }
}
