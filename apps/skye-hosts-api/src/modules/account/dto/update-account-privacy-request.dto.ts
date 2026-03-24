import type { IUpdateAccountPrivacyRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean } from 'class-validator';

export class UpdateAccountPrivacyRequestDto implements IUpdateAccountPrivacyRequestDto {
  @IsBoolean()
  searchEngineIndexingEnabled: boolean;
}
