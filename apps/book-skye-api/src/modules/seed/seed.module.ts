import { Module } from '@nestjs/common';
import { DemoModule } from '../demo/demo.module';
import { SeedController } from './controllers/seed.controller';
import { E2eSeedService } from './providers/e2e-seed.service';
import { SeedService } from './providers/seed.service';

@Module({
  controllers: [SeedController],
  imports: [DemoModule],
  providers: [E2eSeedService, SeedService],
  exports: [E2eSeedService],
})
export class SeedModule {}
