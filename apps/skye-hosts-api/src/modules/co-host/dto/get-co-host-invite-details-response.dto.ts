import type {
  CoHostInviteStatus,
  CoHostRole,
  IGetCoHostInviteDetailsResponseDto,
} from '@repo/skye-hosts-api-client';

export class GetCoHostInviteDetailsResponseDto implements IGetCoHostInviteDetailsResponseDto {
  listingTitle: string;
  inviterName: string;
  role: CoHostRole;
  inviteeEmail: string;
  status: CoHostInviteStatus;
  expiresAt: Date;
}
