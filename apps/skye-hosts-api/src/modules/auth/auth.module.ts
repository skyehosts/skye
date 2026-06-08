import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import { TwilioService } from './providers/twilio.service';
import { checkEmailRateLimitMiddleware } from './rate-limits/check-email-rate-limit.middleware';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [AccountModule, CommonModule, ConfigModule],
  providers: [AuthService, TwilioService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(checkEmailRateLimitMiddleware)
      .forRoutes({ path: 'auth/check-email', method: RequestMethod.POST });
  }
}
