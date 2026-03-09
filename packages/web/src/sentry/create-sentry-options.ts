// Returns a base Sentry.init options object compatible with both @sentry/nextjs (web)
// and @sentry/react-native (Expo). Each app passes its own DSN; shared defaults are
// applied here so options stay consistent across platforms.
export interface SentryBaseOptions {
  dsn: string | undefined;
  tracesSampleRate: number;
  debug: boolean;
  environment: string | undefined;
  ignoreErrors: (string | RegExp)[];
}

export function createSentryOptions(
  dsn: string | undefined,
  environment: string | undefined,
): SentryBaseOptions {
  return {
    dsn,
    tracesSampleRate: 0,
    debug: false,
    environment,
    ignoreErrors: [
      // Browser/web noise — harmless no-ops when used in React Native
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Common across platforms
      "Non-Error promise rejection captured",
      /^NetworkError/,
      /^Failed to fetch/,
    ],
  };
}
