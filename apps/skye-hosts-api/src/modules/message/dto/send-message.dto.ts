import type {
  ISendMessageRequestDto,
  ISendMessageResponseDto,
} from '@repo/skye-hosts-api-client';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class SendMessageRequestDto implements ISendMessageRequestDto {
  @IsNumber()
  @Min(1)
  bookingId: number;

  @IsString()
  @MaxLength(5000)
  content: string;
}

export class SendMessageResponseDto implements ISendMessageResponseDto {
  id: number;
  bookingId: number;
  senderId: number;
  content: string;
  createdAt: Date;
}
