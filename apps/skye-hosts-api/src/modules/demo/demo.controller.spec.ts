import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/providers/config.service';
import { DemoController } from './demo.controller';
import { DemoService } from './providers';

describe('DemoController', () => {
  let controller: DemoController;

  const mockDemoService = {
    getDemoData: jest.fn().mockResolvedValue(undefined),
    submitForm: jest.fn().mockResolvedValue(undefined),
    saveWithTransactions: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [DemoController],
      providers: [DemoService, ConfigService],
    })
      .overrideProvider(DemoService)
      .useValue(mockDemoService)
      .compile();

    controller = app.get<DemoController>(DemoController);
  });

  describe('foo bar', () => {
    it('Should foo bar', async () => {
      expect(true).toEqual(true);
    });
  });
});
