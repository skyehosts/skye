'use client';

import { ThemeProvider } from '@mui/material/styles';
import { createHighlandTheme } from '@repo/web/highland-theme';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createHighlandTheme({
        body: '"Open Sans", sans-serif',
        heading: '"Montserrat", sans-serif',
      }),
    [],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
