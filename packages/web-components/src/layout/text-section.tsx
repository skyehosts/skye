'use client';

import { Box, Divider, Typography } from '@mui/material';
import { type ReactNode } from 'react';

interface TextSectionProps {
  title: string;
  children: ReactNode;
}

export function TextSection({ title, children }: TextSectionProps) {
  return (
    <Box
      component="section"
      sx={{
        color: 'grey.700',
        '&:last-child .text-section-divider': { display: 'none' },
      }}
    >
      <Typography variant="h5" sx={{ mt: '20px', mb: '10px' }}>
        {title}
      </Typography>
      {children}
      <Divider
        className="text-section-divider"
        sx={(theme) => ({
          width: '40px',
          height: '3px',
          my: '30px',
          bgcolor: theme.palette.brand.accent,
          border: 'none',
        })}
      />
    </Box>
  );
}
