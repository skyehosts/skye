import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Environments } from '@repo/common';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { validateConfig } from '../../../utils/validate-config.util';

class AppEnvironmentVariablesValidator {
  @IsOptional()
  @IsNumber()
  GITHUB_RUN_NUMBER: number;

  @IsEnum(Environments)
  SKYE_ENVIRONMENT: Environments;

  @IsOptional()
  @IsString()
  GIT_COMMIT: string;

  @IsOptional()
  @IsString()
  GIT_REF: string;

  @IsString()
  @IsNotEmpty()
  HTTP_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  RELEASE_VERSION: string;

  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  RESEND_FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  STRIPE_SECRET: string;

  @IsString()
  @IsNotEmpty()
  APP_LINK_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_IMAGES_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  AWS_CLOUDFRONT_IMAGES_DOMAIN: string;

  @IsString()
  @IsNotEmpty()
  AWS_SQS_ENVIRONMENT: string;

  @IsString()
  @IsNotEmpty()
  API_BASE_URL: string;

  @IsOptional()
  @IsString()
  EXPO_ACCESS_TOKEN: string;

  @IsOptional()
  @IsString()
  LOG_REQUESTS: string;

  @IsOptional()
  @IsString()
  LOG_RESPONSES: string;
}

export interface IEnvironmentVariables {
  githubRunNumber: number;
  environment: Environments;
  gitCommit: string;
  gitRef: string;
  httpSecret: string;
  jwtSecret: string;
  releaseVersion: string;
  resendApiKey: string;
  resendFromEmail: string;
  stripeSecret: string;
  appLinkBaseUrl: string;
  awsS3ImagesBucket: string;
  awsCloudfrontImagesDomain: string;
  awsSqsEnvironment: string;
  apiBaseUrl: string;
  expoAccessToken: string | undefined;
  logRequests: boolean;
  logResponses: boolean;
}

@Injectable()
export class ConfigService extends NestConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    super();
    if (process.env.NODE_ENV !== 'test') {
      this.logger.debug('Validating application environment variables');
      validateConfig(process.env, AppEnvironmentVariablesValidator);
    }
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
      resendApiKey: this.get<string>('RESEND_API_KEY'),
      resendFromEmail: this.get<string>('RESEND_FROM_EMAIL'),
      stripeSecret: this.get<string>('STRIPE_SECRET'),
      appLinkBaseUrl: this.get<string>('APP_LINK_BASE_URL'),
      awsS3ImagesBucket: this.get<string>('AWS_S3_IMAGES_BUCKET'),
      awsCloudfrontImagesDomain: this.get<string>(
        'AWS_CLOUDFRONT_IMAGES_DOMAIN',
      ),
      awsSqsEnvironment: this.get<string>('AWS_SQS_ENVIRONMENT'),
      apiBaseUrl: this.get<string>('API_BASE_URL'),
      expoAccessToken: this.get<string>('EXPO_ACCESS_TOKEN') || undefined,
      logRequests: this.get<string>('LOG_REQUESTS') !== 'false',
      logResponses: this.get<string>('LOG_RESPONSES') !== 'false',
    };
  }
}
