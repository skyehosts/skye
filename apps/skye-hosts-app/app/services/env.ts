import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

console.debug("[env] Constants.expoConfig exists:", !!Constants.expoConfig);
console.debug("[env] extra keys:", Object.keys(extra));
console.debug("[env] full extra:", JSON.stringify(extra));
console.debug(
  "[env] BYPASS_GEOCODING raw value:",
  JSON.stringify(extra["BYPASS_GEOCODING"]),
  "type:",
  typeof extra["BYPASS_GEOCODING"],
);

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
    return extra["SENTRY_DSN"] as string | undefined;
  },
  get skyeEnvironment() {
    return requireEnv("SKYE_ENVIRONMENT");
  },
  get logLevel() {
    return extra["LOG_LEVEL"] as string | undefined;
  },
  get googleMapsApiKey() {
    return requireEnv("GOOGLE_MAPS_API_KEY");
  },
  get showDevMenu() {
    return extra["SHOW_DEV_MENU"] === "true";
  },
  get bypassGeocoding() {
    const raw = extra["BYPASS_GEOCODING"];
    const result = raw === "true";
    console.debug(
      "[env] bypassGeocoding getter — raw:",
      JSON.stringify(raw),
      "type:",
      typeof raw,
      "result:",
      result,
    );
    return result;
  },
};
