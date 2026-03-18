import type { IUpdateListingImageOrderRequestDto } from '@repo/skye-hosts-api-client';
import { IsArray, IsNumberString, IsUUID } from 'class-validator';

export class UpdateListingImageOrderRequestDto implements IUpdateListingImageOrderRequestDto {
  @IsNumberString()
  listingId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  imageIds: string[];
}
