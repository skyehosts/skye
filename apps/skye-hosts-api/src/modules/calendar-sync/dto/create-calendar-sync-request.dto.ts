import type { ICreateCalendarSyncRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCalendarSyncRequestDto implements ICreateCalendarSyncRequestDto {
  @IsString()
  @IsIn(['airbnb', 'booking_com', 'other'])
  platform: 'airbnb' | 'booking_com' | 'other';

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsUrl()
  importUrl?: string;

  @IsOptional()
  @IsBoolean()
  isImportEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isExportEnabled?: boolean;
}
