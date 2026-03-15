import type {
  CoHostInviteStatus,
  CoHostRole,
  ICoHostInviteDto,
  IGetCoHostInvitesResponseDto,
} from '@repo/skye-hosts-api-client';

export class CoHostInviteDto implements ICoHostInviteDto {
  id: number;
  inviteeEmail: string;
  role: CoHostRole;
  status: CoHostInviteStatus;
  createdAt: Date;
  expiresAt: Date;
}

export class GetCoHostInvitesResponseDto implements IGetCoHostInvitesResponseDto {
  invites: CoHostInviteDto[];
}
