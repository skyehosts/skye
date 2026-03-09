import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { StripeService } from './providers';

@Module({
  exports: [StripeService],
  imports: [ConfigModule],
  providers: [StripeService],
})
export class StripeModule {}
