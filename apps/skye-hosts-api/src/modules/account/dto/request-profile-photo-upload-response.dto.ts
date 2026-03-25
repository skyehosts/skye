import type { IRequestProfilePhotoUploadResponseDto } from '@repo/skye-hosts-api-client';

export class RequestProfilePhotoUploadResponseDto implements IRequestProfilePhotoUploadResponseDto {
  uploadUrl: string;
  photoKey: string;
}
