import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { CoHostModule } from '../co-host/co-host.module';
import { Listing } from '../listing/entities';
import { CalendarSyncController } from './controllers';
import { CalendarBlock, CalendarSync } from './entities';
import {
  CalendarExportService,
  CalendarImportSchedulerService,
  CalendarImportService,
  CalendarSyncService,
  IcalParserService,
} from './providers';

@Module({
  controllers: [CalendarSyncController],
  imports: [
    CoHostModule,
    // Booking and Listing registered here because importing BookingModule/ListingModule
    // would create circular dependencies. Only read access is needed for export.
    TypeOrmModule.forFeature([CalendarSync, CalendarBlock, Booking, Listing]),
  ],
  providers: [
    CalendarSyncService,
    CalendarExportService,
    CalendarImportService,
    CalendarImportSchedulerService,
    IcalParserService,
  ],
  exports: [CalendarSyncService],
})
export class CalendarSyncModule {}
