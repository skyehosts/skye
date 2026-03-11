'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { Environments } from '@repo/common';
import type { ReactNode } from 'react';

if (process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT !== Environments.PRODUCTION) {
  ClassNameGenerator.configure((componentName) => componentName);
}

export function MuiProvider({ children }: { children: ReactNode }) {
  return <AppRouterCacheProvider>{children}</AppRouterCacheProvider>;
}
