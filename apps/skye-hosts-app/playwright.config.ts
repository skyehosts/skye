import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /\.e2e-spec\.ts$/,
  globalSetup: "../../packages/skye-hosts-api-client/src/e2e/global-setup.ts",
  timeout: 30_000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: "http://localhost:8081",
    headless: true,
  },
  webServer: [
    {
      command: "pnpm --filter skye-hosts-api dev:e2e",
      port: 3003,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "CI=1 npx expo start --web --port 8081",
      port: 8081,
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        API_URL: "http://localhost:3003",
        SENTRY_DSN: "",
        SKYE_ENVIRONMENT: "test",
      },
    },
  ],
});
