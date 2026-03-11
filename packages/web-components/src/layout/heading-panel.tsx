'use client';

import { Box, Typography, type TypographyProps } from '@mui/material';
import type { ReactNode } from 'react';

interface HeadingPanelProps {
  title: ReactNode;
  component?: TypographyProps['component'];
}

export function HeadingPanel({ title, component = 'h1' }: HeadingPanelProps) {
  return (
    <Box
      sx={(theme) => {
        const gutterXs = theme.spacing(2);
        const gutterSm = theme.spacing(3);
        return {
          pt: { xs: '40px', md: '55px' },
          pb: '38px',
          mb: '40px',
          textAlign: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          mx: `-${gutterXs}`,
          [theme.breakpoints.up('sm')]: {
            mx: `-${gutterSm}`,
          },
        };
      }}
    >
      <Typography
        variant="h3"
        component={component}
        sx={{
          fontWeight: 700,
          px: { xs: 2, sm: 3 },
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
