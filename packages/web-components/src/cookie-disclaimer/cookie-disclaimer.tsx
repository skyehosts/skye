'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { CookiePermissionState } from '../storage/storage-config';
import { StorageKey } from '../storage/storage-keys';
import { useStorage } from '../storage/storage-provider';

export interface CookieDisclaimerProps {
  onResponse: (accepted: boolean) => Promise<void>;
}

export function CookieDisclaimer({ onResponse }: CookieDisclaimerProps) {
  const { get, set, isHydrated } = useStorage();
  const [submitting, setSubmitting] = useState(false);

  const state = get<CookiePermissionState>(StorageKey.COOKIE_PERMISSION_STATE);

  if (!isHydrated || state !== 'unanswered') return null;

  const handleResponse = async (accepted: boolean) => {
    setSubmitting(true);
    try {
      await onResponse(accepted);
      set<CookiePermissionState>(
        StorageKey.COOKIE_PERMISSION_STATE,
        accepted ? 'accepted' : 'declined',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1300,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <Typography variant="body2">
          Do you consent to us storing information in your browser?
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            disabled={submitting}
            onClick={() => handleResponse(true)}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={submitting}
            onClick={() => handleResponse(false)}
          >
            No
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
