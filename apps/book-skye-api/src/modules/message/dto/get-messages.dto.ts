import type {
  IGetMessagesRequestDto,
  IGetMessagesResponseDto,
  IMessageDto,
} from '@repo/skye-hosts-api-client';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetMessagesRequestDto implements IGetMessagesRequestDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bookingId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class MessageDto implements IMessageDto {
  id: number;
  bookingId: number;
  senderId: number;
  senderName: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export class GetMessagesResponseDto implements IGetMessagesResponseDto {
  messages: MessageDto[];
  total: number;
  page: number;
  limit: number;
}
