import type { ICreateCalendarSyncRequestDto } from '@repo/skye-hosts-api-client';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCalendarSyncRequestDto implements ICreateCalendarSyncRequestDto {
  @IsString()
  @IsIn(['airbnb', 'booking_com', 'other'])
  platform: 'airbnb' | 'booking_com' | 'other';

  @IsOptional()
  @IsString()
  label?: string;

  @IsUrl()
  importUrl: string;
}
