import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { Environments } from '@repo/common';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AsyncLocalStorage } from 'node:async_hooks';
import { DtoValidationError } from './dto-validation-error';
import { LoggerService } from './modules/common/providers';

export function mainConfig(app: INestApplication) {
  const isLocal = process.env.SKYE_ENVIRONMENT === Environments.LOCAL;
  app.useLogger(app.get(LoggerService));
  app.use([
    helmet(),
    rateLimit({
      windowMs: 5 * 60 * 1000, // Over 5 minutes
      max: 1500, // limit each IP to 5 requests per second
    }),
  ]);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (classValidatorErrors: ValidationError[]) =>
        new DtoValidationError(classValidatorErrors),
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: isLocal ? true : process.env.CORS_WHITELIST.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
}

export interface RequestContext {
  requestId?: string;
  userId?: string;
  email: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
