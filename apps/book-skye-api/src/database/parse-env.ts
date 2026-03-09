import { DataSourceOptions } from 'typeorm';

export function parseDatabaseEnv() {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT, 10)
      : 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    logging: process.env.DATABASE_LOGGING === 'true',
    synchronize: false,
    maxConnections: 100, // 100 is postgres max
    ssl:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  };
}

export function buildDataSourceOptions(
  overrides?: Partial<DataSourceOptions>,
): DataSourceOptions {
  const env = parseDatabaseEnv();
  // NB: url automatically injected into process.env by Heroku
  const connectionCreds = env.url
    ? {
        url: env.url,
      }
    : {
        host: env.host,
        username: env.username,
        password: env.password,
        port: env.port,
        database: env.name,
      };

  return {
    ...connectionCreds,
    type: env.type as any,
    url: env.url,
    synchronize: env.synchronize,
    dropSchema: false,
    keepConnectionAlive: true,
    logging: env.logging,
    poolSize: env.maxConnections,
    ssl: env.ssl,
    ...overrides,
  } as unknown as DataSourceOptions;
}
