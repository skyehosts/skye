import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { CalendarSyncModule } from '../calendar-sync/calendar-sync.module';
import { CoHostModule } from '../co-host/co-host.module';
import { CommonModule } from '../common/common.module';
import { ListingImage } from '../listing-image/entities';
import { AccommodationTypesController } from './controllers/accommodation-types.controller';
import { AmenitiesController } from './controllers/amenities.controller';
import { ListingPricingController } from './controllers/listing-pricing.controller';
import { ListingQuoteController } from './controllers/listing-quote.controller';
import { ListingController } from './controllers/listing.controller';
import { SpaceTypesController } from './controllers/space-types.controller';
import {
  Listing,
  ListingPriceOverride,
  ListingPricing,
  ListingSeasonPricing,
} from './entities';
import { ListingPricingService, ListingService } from './providers';

@Module({
  controllers: [
    AccommodationTypesController,
    AmenitiesController,
    SpaceTypesController,
    ListingController,
    ListingPricingController,
    ListingQuoteController,
  ],
  exports: [TypeOrmModule, ListingPricingService],
  // ListingImage registered here to avoid circular dep (ListingImageModule imports ListingModule)
  imports: [
    AccountModule,
    CalendarSyncModule,
    CommonModule,
    CoHostModule,
    TypeOrmModule.forFeature([
      Listing,
      ListingImage,
      ListingSeasonPricing,
      ListingPricing,
      ListingPriceOverride,
    ]),
  ],
  providers: [ListingService, ListingPricingService],
})
export class ListingModule {}
