import type { IAcceptCoHostInviteRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class AcceptCoHostInviteRequestDto implements IAcceptCoHostInviteRequestDto {
  @IsString()
  token: string;
}
