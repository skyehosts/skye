import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@repo/book-skye-api-client';
import { DecoratorKeys } from './keys';

export const AuthoriseRole = (...roles: UserRole[]) =>
  SetMetadata(DecoratorKeys.AUTHORISE_ROLE, roles);
