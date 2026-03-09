'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { ReactNode } from 'react';

export function MuiProvider({ children }: { children: ReactNode }) {
  return <AppRouterCacheProvider>{children}</AppRouterCacheProvider>;
}
