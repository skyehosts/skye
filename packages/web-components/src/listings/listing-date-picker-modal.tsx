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
import { dayPickerThemeSx, toDateRange } from './listing-date-picker-styles';
import { ListingModalHeader, listingModalStyles } from './listing-modal-styles';

interface ListingDatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (range: { from: Date; to: Date }) => void;
  initialRange?: { from: Date; to: Date } | null;
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
        <Box sx={dayPickerThemeSx}>
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
