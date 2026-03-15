import type { IRevokeCoHostInviteRequestDto } from '@repo/skye-hosts-api-client';
import { IsNumber } from 'class-validator';

export class RevokeCoHostInviteRequestDto implements IRevokeCoHostInviteRequestDto {
  @IsNumber()
  inviteId: number;
}
