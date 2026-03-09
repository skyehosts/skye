import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /\.e2e-spec\.ts$/,
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:4001",
    headless: true,
  },
  webServer: {
    command: "pnpm dev",
    port: 4001,
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_SKYE_HOSTS_API_URL: "http://localhost:3003",
      NEXTAUTH_SECRET: "test-secret",
      NEXT_PUBLIC_SKYE_ENVIRONMENT: "ci",
    },
  },
});
