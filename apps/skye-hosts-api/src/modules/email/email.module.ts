import { Module } from '@nestjs/common';
import { UnoSendService } from './providers/unosend.service';

@Module({
  providers: [UnoSendService],
  exports: [UnoSendService],
})
export class EmailModule {}
