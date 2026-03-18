import type { IConfirmListingImageUploadsRequestDto } from '@repo/skye-hosts-api-client';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ConfirmListingImageUploadsRequestDto implements IConfirmListingImageUploadsRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  imageIds: string[];
}
