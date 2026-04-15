'use client';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { BookingStep } from './booking-params';

export interface BookingWizardProps {
  step: BookingStep;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
  children: ReactNode;
}

export function BookingWizard({
  step,
  onClose,
  onNext,
  onBack,
  nextDisabled,
  children,
}: BookingWizardProps) {
  const stepNumber = step === 'review' ? 1 : 2;
  const isFinal = step === 'payment';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 1.5,
        }}
      >
        <IconButton onClick={onClose} size="small" aria-label="Close booking">
          <CloseIcon />
        </IconButton>
        <Typography
          component="h1"
          sx={{ fontSize: '1rem', fontWeight: 600, flex: 1 }}
        >
          Confirm and pay
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Step {stepNumber} of 2
        </Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, pb: 12 }}>{children}</Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          display: 'flex',
          gap: 1,
        }}
      >
        {isFinal && (
          <Button variant="outlined" onClick={onBack} sx={{ flex: 1 }}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onNext}
          disabled={nextDisabled}
          sx={{
            flex: isFinal ? 1 : undefined,
            width: isFinal ? undefined : '100%',
          }}
        >
          {isFinal ? 'Confirm booking' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
