import type { IListingImageDto } from '@repo/skye-hosts-api-client';

export function getListingImageUrl(
  image: IListingImageDto,
  width: number,
): string {
  return (
    image.urls.find((u) => u.width === width)?.url ?? image.urls[0]?.url ?? ''
  );
}
