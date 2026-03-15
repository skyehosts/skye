import type { ICreateCoHostInviteResponseDto } from '@repo/skye-hosts-api-client';

export class CreateCoHostInviteResponseDto implements ICreateCoHostInviteResponseDto {
  inviteId: number;
  inviteLink: string;
}
