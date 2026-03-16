import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { EmailModule } from '../email/email.module';
import { Listing } from '../listing/entities';
import { CoHostInviteController } from './controllers';
import { CoHostInvite, ListingUserRole } from './entities';
import { CoHostInviteService, ListingAccessService } from './providers';

@Module({
  controllers: [CoHostInviteController],
  exports: [ListingAccessService],
  imports: [
    CommonModule,
    AccountModule,
    EmailModule,
    TypeOrmModule.forFeature([CoHostInvite, ListingUserRole, Listing]),
  ],
  providers: [CoHostInviteService, ListingAccessService],
})
export class CoHostModule {}
