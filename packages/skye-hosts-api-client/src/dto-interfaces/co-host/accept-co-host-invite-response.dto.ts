import type { CoHostRole } from '../../enums/co-host-enums';

export interface IAcceptCoHostInviteResponseDto {
  listingId: number;
  role: CoHostRole;
}
