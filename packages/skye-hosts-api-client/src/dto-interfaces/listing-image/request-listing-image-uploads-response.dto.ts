export interface IRequestListingImageUploadItemDto {
  imageId: string;
  uploadUrl: string;
}

export interface IRequestListingImageUploadsResponseDto {
  uploads: IRequestListingImageUploadItemDto[];
}
