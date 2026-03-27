'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { differenceInCalendarDays } from 'date-fns';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { dayPickerThemeSx, toDateRange } from './listing-date-picker-styles';
import type { ListingNightRuleProps } from './listing-guest-types';
import {
  buildNightDisabledMatcher,
  formatNightConstraintMessage,
  getMinNightsForDate,
} from './listing-guest-types';
import { ListingModalHeader, listingModalStyles } from './listing-modal-styles';

interface ListingDatePickerModalProps extends ListingNightRuleProps {
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
  minNights,
  minNightsByCheckInDay,
  maxNights,
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

  const fromDate = selectedRange?.from ?? null;
  const toDate = selectedRange?.to ?? null;

  const effectiveMinNights = fromDate
    ? getMinNightsForDate(fromDate, minNights, minNightsByCheckInDay)
    : minNights;

  const isValidRange =
    fromDate != null &&
    toDate != null &&
    (() => {
      const nights = differenceInCalendarDays(toDate, fromDate);
      if (nights < effectiveMinNights) return false;
      if (maxNights !== null && nights > maxNights) return false;
      return true;
    })();

  const canSave = isValidRange;

  function handleSave() {
    if (canSave) {
      onSave({ from: selectedRange!.from!, to: selectedRange!.to! });
    }
  }

  const disabledMatcher =
    fromDate && !toDate
      ? buildNightDisabledMatcher(fromDate, effectiveMinNights, maxNights)
      : { before: new Date() };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <ListingModalHeader title="Select check-in date" onClose={onClose}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add your travel dates for exact pricing
        </Typography>
        {fromDate && !toDate && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontStyle: 'italic' }}
          >
            {formatNightConstraintMessage(effectiveMinNights, maxNights)}
          </Typography>
        )}
      </ListingModalHeader>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box sx={dayPickerThemeSx}>
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            disabled={disabledMatcher}
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
