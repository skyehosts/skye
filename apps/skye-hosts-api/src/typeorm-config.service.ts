import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeOrmCustomLogger } from './database/config';
import { entities } from './database/entities';
import { buildDataSourceOptions, parseDatabaseEnv } from './database/parse-env';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const env = parseDatabaseEnv();
    return buildDataSourceOptions({
      logger: TypeOrmCustomLogger.getInstance(
        'default',
        env.logging ? ['error', 'warn', 'query', 'schema'] : ['error', 'warn'],
      ),
      entities,
      migrations: [join(__dirname, 'migrations', '**', '*.js')],
      migrationsRun: process.env.NODE_ENV !== 'test',
    }) as TypeOrmModuleOptions;
  }
}
