import type { IRequestListingImageUploadResponseDto } from '@repo/skye-hosts-api-client';

export class RequestListingImageUploadResponseDto implements IRequestListingImageUploadResponseDto {
  imageId: string;
  uploadUrl: string;
}
