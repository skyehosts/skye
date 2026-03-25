import type { IGetAccountDetailsResponseDto } from '@repo/skye-hosts-api-client';

export class GetAccountDetailsResponseDto implements IGetAccountDetailsResponseDto {
  email: string | null;
  name: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  searchEngineIndexingEnabled: boolean;
}
