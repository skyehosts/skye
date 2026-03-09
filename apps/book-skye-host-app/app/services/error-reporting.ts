import * as Sentry from "@sentry/react-native";

export function captureException(error: unknown): void {
  Sentry.captureException(error);
}

export function captureMessage(message: string): void {
  Sentry.captureMessage(message);
}

/**
 * Send a test error to verify Sentry is working.
 * Call from any component or screen: `import { sentryTest } from "./services/error-reporting"; sentryTest();`
 */
export function sentryTest(): void {
  Sentry.captureException(
    new Error("Sentry test error from host app - release"),
  );
}
