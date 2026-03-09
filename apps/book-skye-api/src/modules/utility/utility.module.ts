import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { UtilityController } from './utility.controller';

@Module({
  controllers: [UtilityController],
  exports: [],
  imports: [CommonModule],
  providers: [],
})
export class UtilityModule {}
