import * as dotenv from 'dotenv';

// On local only, this is needed to access ENV vars directly on process.env (without ConfigService as it hasn't initialised yet)
// In deployed environments, env vars are already injected into process from Heroku
dotenv.config({ path: constants.envPath });

// Must preceed all except dotenv
// Deliberately using require not import to prevent hoisting it above dotenv.config
// as it relies on process.env.SKYE_GLAMPING_API_SENTRY_DSN
require('./instrument');

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Environments } from '@repo/common';
import { constants } from './constants';
import { mainConfig } from './main.config';
import { AppModule } from './modules/app/app.module';
import { ErrorFormatFilter } from './modules/common/filters';

async function bootstrap() {
  const isLocal = process.env.SKYE_ENVIRONMENT === Environments.LOCAL;
  const isProduction = process.env.SKYE_ENVIRONMENT === Environments.PRODUCTION;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...(!isProduction && {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    }),
  });
  app.useGlobalFilters(new ErrorFormatFilter());
  const logger = new Logger(bootstrap.name);
  if (!isLocal) {
    app.set('trust proxy', 1); // Trust first proxy (Heroku load balancer)
    logger.debug('main', 'env vars', process.env);
  }
  mainConfig(app);
  const port = isLocal ? 3003 : parseInt(process.env.PORT, 10);
  await app.listen(port);
}
bootstrap();
