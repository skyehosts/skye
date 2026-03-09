import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../../../../../packages/skye-hosts-api-client/src';
import { DecoratorKeys } from './keys';

export const AuthoriseRole = (...roles: UserRole[]) =>
  SetMetadata(DecoratorKeys.AUTHORISE_ROLE, roles);
