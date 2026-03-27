'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import type { GuestCounts } from './listing-guest-types';
import { DEFAULT_GUEST_COUNTS } from './listing-guest-types';
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

interface GuestRow {
  key: keyof GuestCounts;
  label: string;
  subtitle: string;
  getMax: (counts: GuestCounts) => number;
  getMin: () => number;
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

  const rows: GuestRow[] = [
    {
      key: 'adults',
      label: 'Adults',
      subtitle: 'Age 13+',
      getMax: (c) => maxGuests - c.children,
      getMin: () => 1,
    },
    {
      key: 'children',
      label: 'Children',
      subtitle: 'Ages 2–12',
      getMax: (c) => (childrenAllowed ? maxGuests - c.adults : 0),
      getMin: () => 0,
    },
    {
      key: 'infants',
      label: 'Infants',
      subtitle: 'Under 2',
      getMax: () => (infantsAllowed ? 5 : 0),
      getMin: () => 0,
    },
    {
      key: 'pets',
      label: 'Pets',
      subtitle: 'Service animals always welcome',
      getMax: () => (petsAllowed ? 5 : 0),
      getMin: () => 0,
    },
  ];

  function handleChange(key: keyof GuestCounts, delta: number) {
    setCounts((prev) => ({ ...prev, [key]: prev[key] + delta }));
  }

  function buildInfoText() {
    let text = `This place has a maximum of ${maxGuests} guests, not including infants.`;
    if (!petsAllowed) text += " Pets aren't allowed.";
    if (!childrenAllowed) text += ' No children.';
    if (!infantsAllowed) text += ' No infants.';
    return text;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" keepMounted>
      <ListingModalHeader title="Guests" onClose={onClose} />
      <DialogContent sx={{ py: 2 }}>
        {rows.map((row) => {
          const max = row.getMax(counts);
          const min = row.getMin();
          const value = counts[row.key];
          const disableMinus = value <= min;
          const disablePlus = value >= max;

          return (
            <Box
              key={row.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {row.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.subtitle}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  disabled={disableMinus}
                  onClick={() => handleChange(row.key, -1)}
                  sx={{ opacity: disableMinus ? 0.3 : 1 }}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <Typography
                  sx={{ minWidth: 24, textAlign: 'center', fontWeight: 500 }}
                >
                  {value}
                </Typography>
                <IconButton
                  size="small"
                  disabled={disablePlus}
                  onClick={() => handleChange(row.key, 1)}
                  sx={{ opacity: disablePlus ? 0.3 : 1 }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
            </Box>
          );
        })}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          {buildInfoText()}
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
