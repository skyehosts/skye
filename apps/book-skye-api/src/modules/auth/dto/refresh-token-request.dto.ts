import type { IRefreshTokenRequestDto } from '@repo/book-skye-api-client';
import { IsString } from 'class-validator';

export class RefreshTokenRequestDto implements IRefreshTokenRequestDto {
  @IsString()
  refreshToken: string;
}
