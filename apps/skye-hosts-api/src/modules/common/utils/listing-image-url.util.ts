import type {
  IListingImageDto,
  IListingImageUrlDto,
} from '@repo/skye-hosts-api-client';
import type { ListingImage } from '../../listing-image/entities';

export const IMAGE_WIDTHS = [320, 640, 960, 1280, 1920];

export function buildDerivedImageUrl(
  cdnDomain: string,
  listingId: number,
  imageId: string,
  width: number,
): string {
  return `https://${cdnDomain}/listings/${listingId}/derived/${width}w/${imageId}.webp`;
}

export function toListingImageDto(
  cdnDomain: string,
  image: ListingImage,
): IListingImageDto {
  const urls: IListingImageUrlDto[] = IMAGE_WIDTHS.map((width) => ({
    width,
    url: buildDerivedImageUrl(cdnDomain, image.listingId, image.id, width),
  }));

  return {
    id: image.id,
    listingId: String(image.listingId),
    position: image.position,
    originalUrl: `https://${cdnDomain}/${image.originalKey}`,
    urls,
  };
}
