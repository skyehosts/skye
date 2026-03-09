import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './providers';

@Module({
  controllers: [AvailabilityController],
  exports: [],
  imports: [CommonModule],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
