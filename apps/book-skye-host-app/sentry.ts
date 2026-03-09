// Sentry initialisation for the React Native / Expo app.
// Imported as a side-effect at the top of app/_layout.tsx so it runs before
// any components are rendered. Captures native crashes (iOS + Android),
// unhandled JS exceptions, and unhandled promise rejections.
import { createSentryOptions } from "@repo/web/sentry";
import * as Sentry from "@sentry/react-native";
import { env } from "./app/services/env";

Sentry.init(createSentryOptions(env.sentryDsn, env.skyeEnvironment));
