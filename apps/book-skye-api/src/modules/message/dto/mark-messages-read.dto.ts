import type {
  IMarkMessagesReadRequestDto,
  IMarkMessagesReadResponseDto,
} from '@repo/skye-hosts-api-client';
import { IsNumber, Min } from 'class-validator';

export class MarkMessagesReadRequestDto implements IMarkMessagesReadRequestDto {
  @IsNumber()
  @Min(1)
  bookingId: number;
}

export class MarkMessagesReadResponseDto implements IMarkMessagesReadResponseDto {
  updatedCount: number;
}
