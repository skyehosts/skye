import type { IUpdateAccountPrivacyResponseDto } from '@repo/skye-hosts-api-client';

export class UpdateAccountPrivacyResponseDto implements IUpdateAccountPrivacyResponseDto {
  searchEngineIndexingEnabled: boolean;
}
