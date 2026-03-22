import type { IToggleFavouriteResponseDto } from '@repo/skye-hosts-api-client';

export class ToggleFavouriteResponseDto implements IToggleFavouriteResponseDto {
  isFavourited: boolean;
}
