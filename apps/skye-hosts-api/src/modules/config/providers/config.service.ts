import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Environments } from '@repo/common';

export interface IEnvironmentVariables {
  githubRunNumber: number;
  environment: Environments;
  gitCommit: string;
  gitRef: string;
  httpSecret: string;
  jwtSecret: string;
  releaseVersion: string;
  stripeSecret: string;
}

@Injectable()
export class ConfigService extends NestConfigService {
  constructor() {
    super();
  }
  getAll(): IEnvironmentVariables {
    return {
      githubRunNumber: this.get<number>('GITHUB_RUN_NUMBER'),
      environment: this.get<Environments>('SKYE_ENVIRONMENT'),
      gitCommit: this.get<string>('GIT_COMMIT'),
      gitRef: this.get<string>('GIT_REF'),
      httpSecret: this.get<string>('HTTP_SECRET'),
      jwtSecret: this.get<string>('JWT_SECRET'),
      releaseVersion: this.get<string>('RELEASE_VERSION'),
      stripeSecret: this.get<string>('STRIPE_SECRET'),
    };
  }
}
