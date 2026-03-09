import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IJwtClaims } from '../guards/bearer-authentication.guard';
import { DecoratorKeys } from './keys';

export const AuthenticatedUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IJwtClaims => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[DecoratorKeys.NEXT_CLAIMS] || {};
  },
);
