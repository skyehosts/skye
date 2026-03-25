import type { IConfirmProfilePhotoUploadRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class ConfirmProfilePhotoUploadRequestDto implements IConfirmProfilePhotoUploadRequestDto {
  @IsString()
  photoKey: string;
}
