import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { Booking } from '../booking/entities';
import { CommonModule } from '../common/common.module';
import { ListingModule } from '../listing/listing.module';
import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { QueueModule } from '../queue/queue.module';
import { MessageTemplateController } from './controllers/message-template.controller';
import { ScheduledMessageController } from './controllers/scheduled-message.controller';
import {
  ListingMessageTemplate,
  MessageLog,
  MessageTemplate,
  ScheduledMessage,
  SentMessage,
  TemplateTrigger,
  TemplateVersion,
} from './entities';
import { MessageTemplateService } from './providers/message-template.service';
import { ScheduledMessageCreationService } from './providers/scheduled-message-creation.service';
import { ScheduledMessageDeliveryService } from './providers/scheduled-message-delivery.service';
import { ScheduledMessageSchedulerService } from './providers/scheduled-message-scheduler.service';
import { TemplateInterpolationService } from './providers/template-interpolation.service';

@Module({
  controllers: [MessageTemplateController, ScheduledMessageController],
  exports: [ScheduledMessageCreationService],
  imports: [
    AccountModule,
    CommonModule,
    ListingModule,
    MessageModule,
    NotificationModule,
    QueueModule,
    TypeOrmModule.forFeature([
      // Booking registered here — circular dep: ScheduledMessageModule → BookingModule → ScheduledMessageModule
      Booking,
      ListingMessageTemplate,
      MessageLog,
      MessageTemplate,
      ScheduledMessage,
      SentMessage,
      TemplateTrigger,
      TemplateVersion,
    ]),
  ],
  providers: [
    MessageTemplateService,
    ScheduledMessageCreationService,
    ScheduledMessageDeliveryService,
    ScheduledMessageSchedulerService,
    TemplateInterpolationService,
  ],
})
export class ScheduledMessageModule {}
