import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@repo/skye-hosts-api-client';
import * as Sentry from '@sentry/nestjs';
import * as jwt from 'jsonwebtoken';
import {
  ConfigService,
  IEnvironmentVariables,
} from '../../config/providers/config.service';
import { DecoratorKeys } from '../decorators';

@Injectable()
export class BearerAuthenticationGuard implements CanActivate {
  private environmentVariables: IEnvironmentVariables;
  private readonly logger = new Logger(BearerAuthenticationGuard.name);
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.environmentVariables = this.configService.getAll();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const ignoreAuth = this.reflector.get<string[]>(
      DecoratorKeys.IGNORE_AUTH,
      context.getHandler(),
    );
    if (
      ignoreAuth &&
      !ignoreAuth.includes(this.environmentVariables.environment)
    ) {
      return true;
    }

    const accessToken = (request.get('Authorization') || '').replace(
      'Bearer ',
      '',
    );

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    try {
      const validationResult = this.validateAccessToken(accessToken);
      if (validationResult.status !== TokenValidationStatus.SUCCESS) {
        throw new HttpException(validationResult, 498);
      }

      request.headers[DecoratorKeys.NEXT_CLAIMS] = validationResult.claims;
      return true;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      this.logger.error(`${BearerAuthenticationGuard.name}:catch()`, '', e);
      Sentry.captureException(e);
      throw new HttpException(
        { status: TokenValidationStatus.ERROR_UNKNOWN },
        401,
      );
    }
  }

  validateAccessToken(accessToken: string): ITokenValidationResult {
    try {
      const decoded = jwt.verify(
        accessToken,
        this.environmentVariables.jwtSecret,
      ) as unknown as IJwtClaims;
      return {
        status: TokenValidationStatus.SUCCESS,
        claims: decoded,
      };
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return { status: TokenValidationStatus.ERROR_EXPIRED };
      }
      if (e instanceof jwt.JsonWebTokenError) {
        return { status: TokenValidationStatus.ERROR_INVALID_FORMAT };
      }
      return { status: TokenValidationStatus.ERROR_UNKNOWN };
    }
  }
}

export interface ITokenValidationResult {
  status: TokenValidationStatus;
  claims?: IJwtClaims;
}

export interface IJwtClaims {
  sub?: number;
  email?: string;
  name?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export enum TokenValidationStatus {
  ERROR_INVALID_FORMAT = 'ERROR_INVALID_FORMAT',
  ERROR_INVALID_KID = 'ERROR_INVALID_KID',
  ERROR_EXPIRED = 'ERROR_EXPIRED',
  ERROR_INVALID_ISSUER = 'ERROR_INVALID_ISSUER',
  ERROR_TOKEN_USE_INVALID = 'ERROR_TOKEN_USE_INVALID',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN',
  SUCCESS = 'SUCCESS',
}
