'use client';

import { Box, Typography, type TypographyProps } from '@mui/material';
import type { ReactNode } from 'react';

import { contentPaddingX } from './layout-constants';

interface HeadingPanelProps {
  title: ReactNode;
  component?: TypographyProps['component'];
}

export function HeadingPanel({ title, component = 'h1' }: HeadingPanelProps) {
  return (
    <Box
      sx={{
        pt: { xs: '40px', md: '55px' },
        pb: { xs: '40px', md: '55px' },
        mb: '40px',
        textAlign: 'center',
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <Typography
        variant="h3"
        component={component}
        sx={{
          fontWeight: 700,
          px: contentPaddingX,
          fontSize: {
            xs: '1.875rem',
            sm: '2.25rem',
            md: '2.75rem',
            lg: '3rem',
          },
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
