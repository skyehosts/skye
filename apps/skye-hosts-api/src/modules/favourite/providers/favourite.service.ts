import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { buildDerivedImageUrl } from '../../common/utils/listing-image-url.util';
import { ConfigService } from '../../config/providers/config.service';
import { ListingImage } from '../../listing-image/entities';
import { Listing } from '../../listing/entities';
import {
  FavouriteListingDto,
  GetFavouritesResponseDto,
  ToggleFavouriteResponseDto,
} from '../dto';
import { Favourite } from '../entities';

@Injectable()
export class FavouriteService {
  private readonly logger = new Logger(FavouriteService.name);
  private readonly cdnDomain: string;

  constructor(
    @InjectRepository(Favourite)
    private readonly favouriteRepo: Repository<Favourite>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(ListingImage)
    private readonly listingImageRepo: Repository<ListingImage>,
    private readonly configService: ConfigService,
  ) {
    this.cdnDomain = this.configService.getAll().awsCloudfrontImagesDomain;
  }

  async toggle(
    accountId: number,
    listingId: number,
  ): Promise<ToggleFavouriteResponseDto> {
    const existing = await this.favouriteRepo.findOne({
      where: { accountId, listingId },
    });

    if (existing) {
      await this.favouriteRepo.remove(existing);
      this.logger.debug(
        `Removed favourite: accountId=${accountId}, listingId=${listingId}`,
      );
      return { isFavourited: false };
    }

    const favourite = this.favouriteRepo.create({ accountId, listingId });
    await this.favouriteRepo.save(favourite);
    this.logger.debug(
      `Added favourite: accountId=${accountId}, listingId=${listingId}`,
    );
    return { isFavourited: true };
  }

  async getFavourites(accountId: number): Promise<GetFavouritesResponseDto> {
    const favourites = await this.favouriteRepo.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
    });

    const listingIds = favourites.map((f) => f.listingId);
    if (listingIds.length === 0) {
      return { favourites: [] };
    }

    const listings = await this.listingRepo.find({
      where: { id: In(listingIds) },
    });

    const coverImages = await this.listingImageRepo.find({
      where: { listingId: In(listingIds), position: 0 },
    });
    const coverMap = new Map(coverImages.map((c) => [c.listingId, c.id]));

    const listingMap = new Map(listings.map((l) => [l.id, l]));

    const result: FavouriteListingDto[] = favourites
      .map((fav) => {
        const listing = listingMap.get(fav.listingId);
        if (!listing) return null;
        const coverId = coverMap.get(listing.id);
        return {
          id: fav.id,
          listingId: listing.id,
          title: listing.title,
          typeId: listing.typeId,
          coverImageUrl: coverId
            ? buildDerivedImageUrl(this.cdnDomain, listing.id, coverId, 320)
            : null,
          favouritedAt: fav.createdAt.toISOString(),
        };
      })
      .filter((item): item is FavouriteListingDto => item !== null);

    return { favourites: result };
  }

  async checkFavourite(
    accountId: number,
    listingId: number,
  ): Promise<ToggleFavouriteResponseDto> {
    const exists = await this.favouriteRepo.findOne({
      where: { accountId, listingId },
    });
    return { isFavourited: !!exists };
  }
}
