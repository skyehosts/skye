import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ListingModule } from '../listing/listing.module';
import { QueueModule } from '../queue/queue.module';
import { ListingImageController } from './controllers';
import { ListingImage } from './entities';
import { ListingImageService } from './providers';

@Module({
  controllers: [ListingImageController],
  exports: [TypeOrmModule],
  imports: [
    CommonModule,
    ListingModule,
    QueueModule,
    TypeOrmModule.forFeature([ListingImage]),
  ],
  providers: [ListingImageService],
})
export class ListingImageModule {}
