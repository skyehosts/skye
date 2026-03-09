import { SetMetadata } from '@nestjs/common';
import { Environments } from '@repo/common';
import { DecoratorKeys } from './keys';

export const IgnoreBearerAuthentication = (
  excludeEnvironments: Environments[] = null,
) => SetMetadata(DecoratorKeys.IGNORE_AUTH, excludeEnvironments || []);
