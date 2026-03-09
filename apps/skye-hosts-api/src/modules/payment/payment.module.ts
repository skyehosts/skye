import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { QueueModule } from '../queue/queue.module';
import { StripeModule } from '../stripe/stripe.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './providers';

@Module({
  controllers: [PaymentController],
  exports: [],
  imports: [AccountModule, QueueModule, StripeModule],
  providers: [PaymentService],
})
export class PaymentModule {}
