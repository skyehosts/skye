import type { IRefreshTokenRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class RefreshTokenRequestDto implements IRefreshTokenRequestDto {
  @IsString()
  refreshToken: string;
}
