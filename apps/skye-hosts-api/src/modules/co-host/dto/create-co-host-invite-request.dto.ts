import type {
  CoHostRole,
  ICreateCoHostInviteRequestDto,
} from '@repo/skye-hosts-api-client';
import { IsEmail, IsIn, IsNumber } from 'class-validator';

export class CreateCoHostInviteRequestDto implements ICreateCoHostInviteRequestDto {
  @IsNumber()
  listingId: number;

  @IsEmail()
  inviteeEmail: string;

  @IsIn(['full_access', 'calendar_and_messaging', 'calendar_only'])
  role: CoHostRole;
}
