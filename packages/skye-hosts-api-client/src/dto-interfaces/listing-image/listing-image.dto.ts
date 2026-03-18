export interface IListingImageDto {
  id: string;
  listingId: string;
  position: number;
  originalUrl: string;
  urls: IListingImageUrlDto[];
}

export interface IListingImageUrlDto {
  width: number;
  url: string;
}
