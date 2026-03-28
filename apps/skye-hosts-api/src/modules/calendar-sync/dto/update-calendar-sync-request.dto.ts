import type { IUpdateCalendarSyncRequestDto } from '@repo/skye-hosts-api-client';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateCalendarSyncRequestDto implements IUpdateCalendarSyncRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
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
