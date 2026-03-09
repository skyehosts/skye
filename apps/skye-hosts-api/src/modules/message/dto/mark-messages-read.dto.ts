import { IsNumber, Min } from 'class-validator';
import type {
  IMarkMessagesReadRequestDto,
  IMarkMessagesReadResponseDto,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class MarkMessagesReadRequestDto implements IMarkMessagesReadRequestDto {
  @IsNumber()
  @Min(1)
  bookingId: number;
}

export class MarkMessagesReadResponseDto implements IMarkMessagesReadResponseDto {
  updatedCount: number;
}
