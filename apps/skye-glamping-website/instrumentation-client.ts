// Sentry initialisation for the browser (client-side).
// Automatically picked up by @sentry/nextjs — do not import this file manually.
// Runs in the user's browser and captures client-side exceptions and unhandled rejections.
import { createSentryOptions } from '@repo/web/sentry';
import * as Sentry from '@sentry/nextjs';

Sentry.init(
  createSentryOptions(
    process.env.NEXT_PUBLIC_GLAMPING_WEBSITE_SENTRY_DSN,
    process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT,
  ),
);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
