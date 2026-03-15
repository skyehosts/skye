import type { CoHostRole } from '../../enums/co-host-enums';

export interface ICreateCoHostInviteRequestDto {
  listingId: number;
  inviteeEmail: string;
  role: CoHostRole;
}
