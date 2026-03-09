// Sentry initialisation for the Edge & Sever runtime.
// Combined equivlant of the old -edge.ts & -server.ts files.
// Automatically picked up by @sentry/nextjs — do not import this file manually.
// Runs in Next.js middleware and any routes/handlers that opt into the Edge runtime.
// Also runs inside the Next.js server process and captures exceptions from Server Components,
// Route Handlers, and server actions.
import { createSentryOptions } from '@repo/web/sentry';
import * as Sentry from '@sentry/nextjs';

Sentry.init(
  createSentryOptions(
    process.env.NEXT_PUBLIC_GLAMPING_WEBSITE_SENTRY_DSN,
    process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT,
  ),
);
