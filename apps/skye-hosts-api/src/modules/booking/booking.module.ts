import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ListingModule } from '../listing/listing.module';
import { NotificationModule } from '../notification/notification.module';
import { ScheduledMessageModule } from '../scheduled-message/scheduled-message.module';
import { BookingController } from './controllers/booking.controller';
import { Booking } from './entities';
import { BookingService } from './providers';

@Module({
  controllers: [BookingController],
  exports: [],
  imports: [
    CommonModule,
    ListingModule,
    NotificationModule,
    ScheduledMessageModule,
    TypeOrmModule.forFeature([Booking]),
  ],
  providers: [BookingService],
})
export class BookingModule {}
