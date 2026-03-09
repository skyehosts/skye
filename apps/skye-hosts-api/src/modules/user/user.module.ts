import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [AccountModule, CommonModule],
  providers: [UserService],
})
export class UserModule {}
