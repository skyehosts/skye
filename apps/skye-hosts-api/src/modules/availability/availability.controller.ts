import { Controller, Get, Logger } from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../common/decorators';
import { AvailabilityResponseDto } from './dto';

@Controller('availability')
export class AvailabilityController {
  private readonly logger = new Logger(AvailabilityController.name);
  constructor() {}

  @Get()
  @IgnoreBearerAuthentication()
  async onRoot(): Promise<AvailabilityResponseDto> {
    return {
      date: new Date(),
    };
  }
}
