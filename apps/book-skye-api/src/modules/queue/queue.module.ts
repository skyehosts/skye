import { Module } from '@nestjs/common';
import { AwsQueueSendMessageService } from './providers';

@Module({
  controllers: [],
  exports: [AwsQueueSendMessageService],
  imports: [],
  providers: [AwsQueueSendMessageService],
})
export class QueueModule {}
