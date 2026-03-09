import { Body, Controller, Logger, Post } from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../common/decorators';
import {
  DemoFormRequestDto,
  DemoFormResponseDto,
  DemoRequestDto,
  DemoResponseDto,
} from './dto';
import { DemoService } from './providers';

@Controller('demo')
export class DemoController {
  private readonly logger = new Logger(DemoController.name);
  constructor(private demoService: DemoService) {}

  @Post()
  @IgnoreBearerAuthentication()
  async onSaveDemo(@Body() body: DemoRequestDto): Promise<DemoResponseDto> {
    return this.demoService.getDemoData();
  }

  @Post('form')
  @IgnoreBearerAuthentication()
  async onSubmitForm(
    @Body() body: DemoFormRequestDto,
  ): Promise<DemoFormResponseDto> {
    return this.demoService.submitForm(body);
  }
}
