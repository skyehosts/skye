import type { CoHostInviteStatus, CoHostRole } from '../../enums/co-host-enums';

export interface ICoHostInviteDto {
  id: number;
  inviteeEmail: string;
  role: CoHostRole;
  status: CoHostInviteStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface IGetCoHostInvitesResponseDto {
  invites: ICoHostInviteDto[];
}
