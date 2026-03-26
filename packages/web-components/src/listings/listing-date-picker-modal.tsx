'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { ListingModalHeader, listingModalStyles } from './listing-modal-styles';

interface ListingDatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (range: { from: Date; to: Date }) => void;
  initialRange?: { from: Date; to: Date } | null;
}

function toDateRange(
  range: { from: Date; to: Date } | null | undefined,
): DateRange | undefined {
  return range ? { from: range.from, to: range.to } : undefined;
}

export function ListingDatePickerModal({
  open,
  onClose,
  onSave,
  initialRange,
}: ListingDatePickerModalProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    toDateRange(initialRange),
  );
  const [month, setMonth] = useState<Date>(initialRange?.from ?? new Date());

  useEffect(() => {
    if (open) {
      setSelectedRange(toDateRange(initialRange));
      setMonth(initialRange?.from ?? new Date());
    }
  }, [open, initialRange]);

  const canSave = selectedRange?.from != null && selectedRange?.to != null;

  function handleSave() {
    if (canSave) {
      onSave({ from: selectedRange!.from!, to: selectedRange!.to! });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <ListingModalHeader title="Select check-in date" onClose={onClose}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add your travel dates for exact pricing
        </Typography>
      </ListingModalHeader>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box
          sx={(theme) => ({
            '& .rdp-root': {
              '--rdp-accent-color': theme.palette.custom.seaGlassTeal,
              '--rdp-accent-background-color':
                theme.palette.custom.driftwoodSand,
              '--rdp-today-color': theme.palette.custom.heatherPurple,
              '--rdp-range_start-date-background-color':
                theme.palette.primary.main,
              '--rdp-range_start-color': '#fff',
              '--rdp-range_end-date-background-color':
                theme.palette.primary.main,
              '--rdp-range_end-color': '#fff',
              '--rdp-range_middle-background-color':
                theme.palette.custom.driftwoodSand,
              '--rdp-range_middle-color': theme.palette.primary.main,
              '--rdp-selected-border': `2px solid ${theme.palette.primary.main}`,
              fontFamily: theme.typography.fontFamily,
            },
          })}
        >
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            disabled={{ before: new Date() }}
            numberOfMonths={1}
            month={month}
            onMonthChange={setMonth}
          />
        </Box>
      </DialogContent>
      <Box sx={listingModalStyles.bottomBar}>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!canSave} onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Dialog>
  );
}
