import type { IUpdateCalendarSyncRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class UpdateCalendarSyncRequestDto implements IUpdateCalendarSyncRequestDto {
  @IsOptional()
  @IsUrl()
  importUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isImportEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isExportEnabled?: boolean;
}
