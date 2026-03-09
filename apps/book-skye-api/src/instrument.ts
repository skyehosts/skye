import * as Sentry from '@sentry/nestjs';
Sentry.init({
  dsn: process.env.BOOK_SKYE_API_SENTRY_DSN,
  environment: process.env.SKYE_ENVIRONMENT,
});
