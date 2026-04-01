import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { getFromContainer } from 'class-validator';
import { DataSource } from 'typeorm';
import {
  BookingModule,
  CoHostModule,
  CommonModule,
  DemoModule,
  EmailModule,
  FavouriteModule,
  ListingModule,
  MessageModule,
  ScheduledMessageModule,
} from '..';
import { setupTestDataSource } from '../../test-setup';
import { TypeOrmConfigService } from '../../typeorm-config.service';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { AvailabilityModule } from '../availability/availability.module';
import { CalendarSyncModule } from '../calendar-sync/calendar-sync.module';
import { UniqueByPropertyValidator } from '../common/validators';
import { ListingImageModule } from '../listing-image/listing-image.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { SeedModule } from '../seed/seed.module';
import { UserModule } from '../user/user.module';
import { UtilityModule } from '../utility/utility.module';

@Module({
  imports: [
    SentryModule.forRoot(), //Must preceed all others
    ScheduleModule.forRoot(),
    AccountModule,
    AuthModule,
    AvailabilityModule,
    BookingModule,
    CalendarSyncModule,
    CoHostModule,
    CommonModule,
    DemoModule,
    EmailModule,
    FavouriteModule,
    ListingImageModule,
    ListingModule,
    MessageModule,
    NotificationModule,
    PaymentModule,
    ScheduledMessageModule,
    SeedModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        if (process.env.NODE_ENV === 'test') {
          return setupTestDataSource();
        }
        return new DataSource(options).initialize();
      },
    }),
    UserModule,
    UtilityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(dataSource: DataSource) {
    // The preferred solution for this is here: https://github.com/nestjs/nest/issues/528
    // Unfortunately when the application is built with webpack, it will be undefined within the validator.
    // So this is a temporary workaround
    getFromContainer(UniqueByPropertyValidator).setDataSource(dataSource);
  }
}
