import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

function requireEnv(name: string): string {
  const value = extra[name] as string | undefined;
  // We allow them to be null,0,'' beacuse sometime in local dev we don't want to set them (like Sentry DSN for example)
  if (value === undefined) {
    throw new Error(`Environment variable "${name}" is not set.`);
  }
  return value;
}

export const env = {
  get apiUrl() {
    return requireEnv("API_URL");
  },
  get sentryDsn() {
    return requireEnv("SENTRY_DSN");
  },
  get skyeEnvironment() {
    return requireEnv("SKYE_ENVIRONMENT");
  },
};
