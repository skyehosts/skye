// Root-level error boundary — catches unhandled errors that bubble up past all route-level
// error.tsx files, including errors thrown in the root layout itself.
// Replaces the entire page (must render its own <html>/<body>).
// Next.js docs: https://nextjs.org/docs/app/api-reference/file-conventions/global-error
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
