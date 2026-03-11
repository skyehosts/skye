'use client';

import { Box, type BoxProps } from '@mui/material';
import { type ReactNode } from 'react';

interface PrincipalColumnProps {
  children: ReactNode;
  sx?: BoxProps['sx'];
}

export function PrincipalColumn({ children, sx }: PrincipalColumnProps) {
  return (
    <Box
      sx={[
        {
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontSize: {
            xs: '1rem',
            md: '1.0625rem',
            lg: '1.125rem',
            xl: '1.1875rem',
          },
          width: {
            xs: '100%',
            md: '75%',
            lg: '65%',
            xl: '50%',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
