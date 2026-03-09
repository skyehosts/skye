import { IsString } from 'class-validator';
import type { IRefreshTokenRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class RefreshTokenRequestDto implements IRefreshTokenRequestDto {
  @IsString()
  refreshToken: string;
}
