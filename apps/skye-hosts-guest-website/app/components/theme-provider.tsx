'use client';

import { AppThemeProvider as SharedAppThemeProvider } from '@repo/web/app-theme-provider';
import type { ReactNode } from 'react';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <SharedAppThemeProvider
      fontBody='"Open Sans", sans-serif'
      fontHeading='"Montserrat", sans-serif'
    >
      {children}
    </SharedAppThemeProvider>
  );
}
