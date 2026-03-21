import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { Booking } from '../booking/entities';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { NotificationModule } from '../notification/notification.module';
import { MessageController } from './controllers';
import { Message } from './entities';
import { MessageGateway } from './gateways';
import { MessageService } from './providers';

@Module({
  controllers: [MessageController],
  exports: [MessageGateway, MessageService, TypeOrmModule],
  imports: [
    AccountModule,
    CommonModule,
    ConfigModule,
    NotificationModule,
    // Booking registered here — circular dep: MessageModule → BookingModule → ScheduledMessageModule → MessageModule
    TypeOrmModule.forFeature([Message, Booking]),
  ],
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
