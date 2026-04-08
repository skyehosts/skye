import { ExpoConfig } from "expo/config";

import appJson from "./app.json";

const base = appJson.expo;

const config: ExpoConfig = {
  ...base,
  ios: {
    ...base.ios,
    config: {
      ...base.ios?.config,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    ...base.android,
    config: {
      ...base.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  extra: {
    ...base.extra,
    SKYE_ENVIRONMENT: process.env.SKYE_ENVIRONMENT,
    SENTRY_DSN: process.env.SENTRY_DSN,
    API_URL: process.env.API_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    BYPASS_GEOCODING: process.env.BYPASS_GEOCODING,
    SHOW_DEV_MENU: process.env.SHOW_DEV_MENU,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: `https://u.expo.dev/${base.extra.eas.projectId}`,
  },
};

export default config;
