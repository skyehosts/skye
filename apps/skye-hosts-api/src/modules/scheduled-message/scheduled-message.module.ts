import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
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

@Module({
  controllers: [MessageTemplateController, ScheduledMessageController],
  exports: [ScheduledMessageCreationService],
  imports: [
    CommonModule,
    MessageModule,
    NotificationModule,
    QueueModule,
    TypeOrmModule.forFeature([
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
  ],
})
export class ScheduledMessageModule {}
