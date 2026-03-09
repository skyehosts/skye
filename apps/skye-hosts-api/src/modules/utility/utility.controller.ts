import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../common/decorators';
import { SecretAuthenticationGuard } from '../common/guards';

@Controller('utility')
export class UtilityController {
  private readonly logger = new Logger(UtilityController.name);
  constructor() {}

  @Post('throw-500')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onThrow500(): Promise<void> {
    const x: any = null;
    x.foo(); // Compiles, throws at runtime: TypeError
  }

  @Post('throw-400')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onThrow400(): Promise<void> {
    throw new BadRequestException();
  }

  @Post('do-log-in-debug')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onDoLogInDebug(): Promise<void> {
    this.logger.debug('foo', 'bar', {
      apples: 'oranges',
    });
  }

  @Post('get-env-vars')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onLogEnvVars(): Promise<any> {
    return process.env;
  }

  @Get('healthcheck')
  @IgnoreBearerAuthentication()
  async onHealth(): Promise<boolean> {
    return true;
  }
}
