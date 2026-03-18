import type { IConfirmListingImageUploadRequestDto } from '@repo/skye-hosts-api-client';
import { IsUUID } from 'class-validator';

export class ConfirmListingImageUploadRequestDto implements IConfirmListingImageUploadRequestDto {
  @IsUUID()
  imageId: string;
}
