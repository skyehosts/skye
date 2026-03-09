// Route-level error boundary — catches unhandled errors thrown within a route segment
// and its children (Server and Client Components). Renders in place of the failed segment,
// so the rest of the page layout remains intact.
// Next.js docs: https://nextjs.org/docs/app/api-reference/file-conventions/error
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
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
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
