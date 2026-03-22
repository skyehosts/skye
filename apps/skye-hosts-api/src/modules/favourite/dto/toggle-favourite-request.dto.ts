import type { IToggleFavouriteRequestDto } from '@repo/skye-hosts-api-client';
import { IsInt } from 'class-validator';

export class ToggleFavouriteRequestDto implements IToggleFavouriteRequestDto {
  @IsInt()
  listingId: number;
}
