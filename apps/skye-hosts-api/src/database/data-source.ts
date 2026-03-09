import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';
import { buildDataSourceOptions } from './parse-env';

export const dataSource = new DataSource(
  buildDataSourceOptions({
    logging: process.env.NODE_ENV !== 'production',
    entities,
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  }),
);
