import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { NotificationModule } from '../notification/notification.module';
import { MessageController } from './controllers';
import { Message } from './entities';
import { MessageGateway } from './gateways';
import { MessageService } from './providers';

@Module({
  controllers: [MessageController],
  exports: [MessageGateway, MessageService],
  imports: [
    CommonModule,
    ConfigModule,
    NotificationModule,
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
