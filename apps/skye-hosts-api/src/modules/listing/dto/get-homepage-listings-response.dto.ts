import type {
  IGetHomepageListingsResponseDto,
  IHomepageListingDto,
} from '@repo/skye-hosts-api-client';

export class HomepageListingDto implements IHomepageListingDto {
  id: number;
  title: string;
  typeId: IHomepageListingDto['typeId'];
  highlights: IHomepageListingDto['highlights'];
  coverImageUrl: string | null;
}

export class GetHomepageListingsResponseDto implements IGetHomepageListingsResponseDto {
  listings: HomepageListingDto[];
}
