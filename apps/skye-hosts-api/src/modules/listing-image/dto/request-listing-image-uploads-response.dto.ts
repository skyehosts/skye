import type {
  IRequestListingImageUploadItemDto,
  IRequestListingImageUploadsResponseDto,
} from '@repo/skye-hosts-api-client';

export class RequestListingImageUploadItemDto implements IRequestListingImageUploadItemDto {
  imageId: string;
  uploadUrl: string;
}

export class RequestListingImageUploadsResponseDto implements IRequestListingImageUploadsResponseDto {
  uploads: RequestListingImageUploadItemDto[];
}
