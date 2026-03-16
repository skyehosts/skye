import { Module } from '@nestjs/common';
import { ResendService } from './providers/resend.service';

@Module({
  providers: [ResendService],
  exports: [ResendService],
})
export class EmailModule {}
