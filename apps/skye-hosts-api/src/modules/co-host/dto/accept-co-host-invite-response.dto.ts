import type {
  CoHostRole,
  IAcceptCoHostInviteResponseDto,
} from '@repo/skye-hosts-api-client';

export class AcceptCoHostInviteResponseDto implements IAcceptCoHostInviteResponseDto {
  listingId: number;
  role: CoHostRole;
}
