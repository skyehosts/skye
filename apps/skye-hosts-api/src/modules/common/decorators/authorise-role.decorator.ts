import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@repo/skye-hosts-api-client';
import { DecoratorKeys } from './keys';

export const AuthoriseRole = (...roles: UserRole[]) =>
  SetMetadata(DecoratorKeys.AUTHORISE_ROLE, roles);
