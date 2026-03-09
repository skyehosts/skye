import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import { TwilioService } from './providers/twilio.service';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [AccountModule, CommonModule, ConfigModule],
  providers: [AuthService, TwilioService],
})
export class AuthModule {}
