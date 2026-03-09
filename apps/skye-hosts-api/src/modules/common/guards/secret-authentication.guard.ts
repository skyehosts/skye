import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Environments } from '@repo/common';
import {
  ConfigService,
  IEnvironmentVariables,
} from '../../config/providers/config.service';

@Injectable()
export class SecretAuthenticationGuard implements CanActivate {
  private environmentVariables: IEnvironmentVariables;
  private readonly logger = new Logger(SecretAuthenticationGuard.name);
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.environmentVariables = this.configService.getAll();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const argumentsHosts = context.switchToHttp();
    const request = argumentsHosts.getRequest();
    if (this.environmentVariables.environment !== Environments.PRODUCTION) {
      return true;
    }
    return new Promise((resolve, reject) => {
      const secret: string = request.get('secret');
      return resolve(secret && secret === this.environmentVariables.httpSecret);
    });
  }
}
