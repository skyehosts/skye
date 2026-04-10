'use client';

import { ThemeProvider } from '@mui/material/styles';
import { createHighlandTheme } from '@repo/web/highland-theme';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createHighlandTheme({
        body: 'var(--font-open-sans), sans-serif',
        heading: 'var(--font-lora), serif',
      }),
    [],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
