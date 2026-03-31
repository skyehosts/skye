'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { GuestCounterRows } from './listing-guest-counter-rows';
import type { GuestCounts } from './listing-guest-types';
import {
  DEFAULT_GUEST_COUNTS,
  buildGuestInfoText,
  buildGuestRows,
} from './listing-guest-types';

interface ListingGuestSelectorPopupProps {
  open: boolean;
  onClose: () => void;
  onChange: (guests: GuestCounts) => void;
  initialGuests?: GuestCounts;
  maxGuests: number;
  childrenAllowed: boolean;
  infantsAllowed: boolean;
  petsAllowed: boolean;
}

export function ListingGuestSelectorPopup({
  open,
  onClose,
  onChange,
  initialGuests,
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
}: ListingGuestSelectorPopupProps) {
  const [counts, setCounts] = useState<GuestCounts>(
    initialGuests ?? DEFAULT_GUEST_COUNTS,
  );

  useEffect(() => {
    if (open) {
      setCounts(initialGuests ?? DEFAULT_GUEST_COUNTS);
    }
  }, [open, initialGuests]);

  const rows = buildGuestRows(
    maxGuests,
    childrenAllowed,
    infantsAllowed,
    petsAllowed,
  );

  function handleChange(key: keyof GuestCounts, delta: number) {
    const next = { ...counts, [key]: counts[key] + delta };
    setCounts(next);
    onChange(next);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1299,
          bgcolor: 'rgba(0, 0, 0, 0.15)',
        }}
      />

      {/* Popup */}
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          zIndex: 1300,
          width: 320,
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Guests
          </Typography>
        </Box>

        {/* Counter rows */}
        <Box sx={{ px: 3, pb: 1 }}>
          <GuestCounterRows
            counts={counts}
            rows={rows}
            onChangeKey={handleChange}
          />
        </Box>

        {/* Info text + footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            px: 3,
            pb: 2,
            pt: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ maxWidth: 200 }}
          >
            {buildGuestInfoText(
              maxGuests,
              petsAllowed,
              childrenAllowed,
              infantsAllowed,
            )}
          </Typography>
          <Button variant="text" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Paper>
    </>
  );
}
