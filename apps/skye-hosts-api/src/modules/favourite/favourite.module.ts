import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ListingModule } from '../listing/listing.module';
import { FavouriteController } from './controllers/favourite.controller';
import { Favourite } from './entities';
import { FavouriteService } from './providers/favourite.service';

@Module({
  controllers: [FavouriteController],
  exports: [],
  imports: [CommonModule, ListingModule, TypeOrmModule.forFeature([Favourite])],
  providers: [FavouriteService],
})
export class FavouriteModule {}
