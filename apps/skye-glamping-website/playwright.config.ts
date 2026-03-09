import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /\.e2e-spec\.ts$/,
  globalSetup: '../../packages/skye-hosts-api-client/src/e2e/global-setup.ts',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4003',
    headless: true,
  },
  webServer: [
    {
      command: 'pnpm --filter skye-hosts-api dev:e2e',
      port: 3003,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm dev',
      port: 4003,
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        NEXT_PUBLIC_SKYE_HOSTS_API_URL: 'http://localhost:3003',
        NEXTAUTH_SECRET: 'test-secret',
        NEXT_PUBLIC_SKYE_ENVIRONMENT: 'local',
      },
    },
  ],
});
