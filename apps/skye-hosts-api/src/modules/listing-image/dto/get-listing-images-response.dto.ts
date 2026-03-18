import type {
  IGetListingImagesResponseDto,
  IListingImageDto,
} from '@repo/skye-hosts-api-client';

export class GetListingImagesResponseDto implements IGetListingImagesResponseDto {
  images: IListingImageDto[];
}
