import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { DemoController } from './demo.controller';
import { Demo } from './entities';
import { DemoService } from './providers';

@Module({
  controllers: [DemoController],
  exports: [],
  imports: [CommonModule, TypeOrmModule.forFeature([Demo])],
  providers: [DemoService],
})
export class DemoModule {}
