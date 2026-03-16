import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { EmailModule } from '../email/email.module';
import { NotificationController } from './controllers/notification.controller';
import {
  DeviceToken,
  NotificationHistory,
  NotificationPreference,
} from './entities';
import {
  EmailNotificationService,
  ExpoPushClient,
  NotificationService,
  PushNotificationService,
} from './providers';

@Module({
  controllers: [NotificationController],
  exports: [NotificationService, PushNotificationService],
  imports: [
    AccountModule,
    CommonModule,
    ConfigModule,
    EmailModule,
    TypeOrmModule.forFeature([
      DeviceToken,
      NotificationHistory,
      NotificationPreference,
    ]),
  ],
  providers: [
    EmailNotificationService,
    ExpoPushClient,
    NotificationService,
    PushNotificationService,
  ],
})
export class NotificationModule {}
