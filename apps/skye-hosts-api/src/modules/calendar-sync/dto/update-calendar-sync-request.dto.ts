import type { IUpdateCalendarSyncRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateCalendarSyncRequestDto implements IUpdateCalendarSyncRequestDto {
  @IsOptional()
  @IsString()
  label?: string;

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
