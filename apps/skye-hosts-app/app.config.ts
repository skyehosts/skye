import { ExpoConfig } from "expo/config";

import appJson from "./app.json";

const base = appJson.expo;

const config: ExpoConfig = {
  ...base,
  extra: {
    ...base.extra,
    SKYE_ENVIRONMENT: process.env.SKYE_ENVIRONMENT,
    SENTRY_DSN: process.env.SENTRY_DSN,
    API_URL: process.env.API_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: `https://u.expo.dev/${base.extra.eas.projectId}`,
  },
};

export default config;
