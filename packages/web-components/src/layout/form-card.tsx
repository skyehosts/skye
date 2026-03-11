'use client';

import { Box, Card, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FormCardProps {
  title: string;
  children: ReactNode;
}

export function FormCard({ title, children }: FormCardProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 4 },
          borderColor: 'grey.300',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
          {title}
        </Typography>
        {children}
      </Card>
    </Box>
  );
}
