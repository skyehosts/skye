import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { StripeModule } from '../stripe/stripe.module';
import { Account } from './entities/account.entity';
import { AccountService } from './providers/account.service';

@Module({
  controllers: [],
  exports: [TypeOrmModule, AccountService],
  imports: [CommonModule, StripeModule, TypeOrmModule.forFeature([Account])],
  providers: [AccountService],
})
export class AccountModule {}
