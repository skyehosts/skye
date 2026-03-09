import type { ArgumentsHost } from '@nestjs/common';
import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Environments } from '@repo/common';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class ErrorFormatFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFormatFilter.name);

  constructor() {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const isNestHttpException = exception instanceof HttpException;
    if (isNestHttpException) {
      response
        .status(exception.getStatus())
        .json((exception as HttpException).getResponse());
    } else {
      Sentry.captureException(exception);
      response
        .status(500)
        .json(
          process.env.SKYE_ENVIRONMENT === Environments.PRODUCTION
            ? 'An error has occured, check logs for details'
            : exception.stack,
        );
    }
  }
}
