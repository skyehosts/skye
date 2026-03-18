export interface IListingImageDto {
  id: string;
  listingId: string;
  position: number;
  urls: IListingImageUrlDto[];
}

export interface IListingImageUrlDto {
  width: number;
  url: string;
}
