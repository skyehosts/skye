import type { IGetAccountDetailsResponseDto } from '@repo/skye-hosts-api-client';

export class GetAccountDetailsResponseDto implements IGetAccountDetailsResponseDto {
  email: string | null;
  emailVerified: boolean;
  name: string;
  phoneNumber: string | null;
}
