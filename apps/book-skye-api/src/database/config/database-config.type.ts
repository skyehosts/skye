export type DatabaseConfig = {
  type?: string;
  url?: string;
  host?: string;
  port: number;
  username?: string;
  password?: string;
  name?: string;
  logging: boolean;
  synchronize: boolean;
  maxConnections: number;
  ssl?: {
    rejectUnauthorized: boolean;
    ca?: string;
    key?: string;
    cert?: string;
  };
};
