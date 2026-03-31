'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { GuestCounterRows } from './listing-guest-counter-rows';
import type { GuestCounts } from './listing-guest-types';
import {
  DEFAULT_GUEST_COUNTS,
  buildGuestInfoText,
  buildGuestRows,
} from './listing-guest-types';
import { ListingModalHeader, listingModalStyles } from './listing-modal-styles';

interface ListingGuestSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (guests: GuestCounts) => void;
  initialGuests?: GuestCounts;
  maxGuests: number;
  childrenAllowed: boolean;
  infantsAllowed: boolean;
  petsAllowed: boolean;
}

export function ListingGuestSelectorModal({
  open,
  onClose,
  onSave,
  initialGuests,
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
}: ListingGuestSelectorModalProps) {
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
    setCounts((prev) => ({ ...prev, [key]: prev[key] + delta }));
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" keepMounted>
      <ListingModalHeader title="Guests" onClose={onClose} />
      <DialogContent sx={{ py: 2 }}>
        <GuestCounterRows
          counts={counts}
          rows={rows}
          onChangeKey={handleChange}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          {buildGuestInfoText(
            maxGuests,
            petsAllowed,
            childrenAllowed,
            infantsAllowed,
          )}
        </Typography>
      </DialogContent>
      <Box sx={listingModalStyles.bottomBar}>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSave(counts)}>
          Save
        </Button>
      </Box>
    </Dialog>
  );
}
