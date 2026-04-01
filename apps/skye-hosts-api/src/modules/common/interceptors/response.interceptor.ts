import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IApiResponse, IApiResponseMeta } from '@repo/skye-hosts-api-client';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ConfigService,
  IEnvironmentVariables,
} from '../../config/providers/config.service';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  private readonly logger = new Logger(ResponseInterceptor.name);
  private readonly responseMeta: IApiResponseMeta;

  private readonly logResponses: boolean;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    const config = this.configService.getAll();
    this.responseMeta = getEnvironmentVarsForHttpResponse(config);
    this.logResponses = config.logResponses;
  }
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap((payload: T) => {
        if (!this.logResponses) return;
        const logPayload = Array.isArray(payload)
          ? { items: payload.slice(0, 2), totalCount: payload.length }
          : payload;
        this.logger.debug(`Response ${request.url}`, '', logPayload);
      }),
      catchError((error) => {
        const isNestHttpException = error instanceof HttpException;
        if (
          !isNestHttpException ||
          (isNestHttpException && error.getStatus() === 400)
        ) {
          // We don't want to log an error for statu codes like 404, 403 etc as this will clutter Production logs
          // So only log 400 (Validation errors which are useful) and for 5XX (!isNestHttpException)
          this.logger.error(`Response ${request.url}`, '', {
            status: error.status,
            message: error.message,
            stack: error.stack,
          });
        }
        return throwError(() => error);
      }),
      map((payload: T) => {
        return {
          payload,
          meta: this.responseMeta,
        } as IApiResponse<T>;
      }),
    );
  }
}

export const getEnvironmentVarsForHttpResponse = (
  environmentVars: IEnvironmentVariables,
): IApiResponseMeta => {
  return {
    githubRunNumber: environmentVars.githubRunNumber,
    environment: environmentVars.environment,
    gitRef: environmentVars.gitRef,
    gitCommit: environmentVars.gitCommit,
    release: environmentVars.releaseVersion,
  };
};
