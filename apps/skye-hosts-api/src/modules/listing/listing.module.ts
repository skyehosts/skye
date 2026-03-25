import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { CoHostModule } from '../co-host/co-host.module';
import { CommonModule } from '../common/common.module';
import { ListingImage } from '../listing-image/entities';
import { AccommodationTypesController } from './controllers/accommodation-types.controller';
import { AmenitiesController } from './controllers/amenities.controller';
import { ListingController } from './controllers/listing.controller';
import { SpaceTypesController } from './controllers/space-types.controller';
import { Listing } from './entities';
import { ListingService } from './providers';

@Module({
  controllers: [
    AccommodationTypesController,
    AmenitiesController,
    SpaceTypesController,
    ListingController,
  ],
  exports: [TypeOrmModule],
  // ListingImage registered here to avoid circular dep (ListingImageModule imports ListingModule)
  imports: [
    AccountModule,
    CommonModule,
    CoHostModule,
    TypeOrmModule.forFeature([Listing, ListingImage]),
  ],
  providers: [ListingService],
})
export class ListingModule {}
