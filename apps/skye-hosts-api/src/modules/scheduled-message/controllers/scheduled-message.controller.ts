import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../../common/decorators';
import { SecretAuthenticationGuard } from '../../common/guards';
import { AwsQueueBaseMessageBody } from '../../queue/types';
import { ScheduledMessageDeliveryService } from '../providers/scheduled-message-delivery.service';

interface SqsScheduledMessageBody extends AwsQueueBaseMessageBody {
  scheduledMessageId: number;
}

@Controller('scheduled-message')
export class ScheduledMessageController {
  private readonly logger = new Logger(ScheduledMessageController.name);

  constructor(
    private readonly deliveryService: ScheduledMessageDeliveryService,
  ) {}

  @Post('on-sqs-message')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onSqsMessage(
    @Body() body: SqsScheduledMessageBody,
  ): Promise<{ received: boolean }> {
    this.logger.debug(
      `SQS scheduled message received: #${body.scheduledMessageId}`,
    );

    await this.deliveryService.deliver(body.scheduledMessageId);

    return { received: true };
  }
}
