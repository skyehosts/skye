import type { CoHostInviteStatus, CoHostRole } from '../../enums/co-host-enums';

export interface IGetCoHostInviteDetailsResponseDto {
  listingTitle: string;
  inviterName: string;
  role: CoHostRole;
  inviteeEmail: string;
  status: CoHostInviteStatus;
  expiresAt: Date;
}
