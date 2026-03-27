'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';
import { differenceInCalendarDays, isBefore, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  DatePickerHeaderText,
  dayPickerThemeSx,
  restrictedDayStyle,
} from './listing-date-picker-styles';
import type { ListingNightRuleProps } from './listing-guest-types';
import {
  buildNightDisabledMatcher,
  buildNightRestrictedMatcher,
  formatGeneralConstraintMessage,
  getMinNightsForDate,
  isNightCountValid,
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
  const theme = useTheme();
  const [from, setFrom] = useState<Date | null>(initialRange?.from ?? null);
  const [to, setTo] = useState<Date | null>(initialRange?.to ?? null);
  const [month, setMonth] = useState<Date>(initialRange?.from ?? new Date());
  const [selectingPhase, setSelectingPhase] = useState<'from' | 'to'>('from');

  useEffect(() => {
    if (open) {
      setFrom(initialRange?.from ?? null);
      setTo(initialRange?.to ?? null);
      setMonth(initialRange?.from ?? new Date());
      setSelectingPhase('from');
    }
  }, [open, initialRange]);

  const effectiveMinNights = from
    ? getMinNightsForDate(from, minNights, minNightsByCheckInDay)
    : minNights;

  const generalConstraintMsg = formatGeneralConstraintMessage(
    minNights,
    minNightsByCheckInDay,
    maxNights,
  );

  const restrictedMatcher =
    selectingPhase === 'to'
      ? buildNightRestrictedMatcher(from, effectiveMinNights, maxNights)
      : [];

  function handleDayClick(day: Date) {
    if (selectingPhase === 'from') {
      setFrom(day);
      setTo(null);
      setSelectingPhase('to');
    } else {
      if (isSameDay(day, from!)) return;
      if (isBefore(day, from!)) {
        setFrom(day);
        setTo(null);
        return;
      }
      const nights = differenceInCalendarDays(day, from!);
      if (!isNightCountValid(nights, effectiveMinNights, maxNights)) return;
      setTo(day);
      setSelectingPhase('from');
    }
  }

  const hasFrom = from != null;
  const hasRange = from != null && to != null;
  const canSave = hasRange;

  const selected: DateRange | undefined =
    from && to ? { from, to } : from ? { from, to: undefined } : undefined;

  const title =
    selectingPhase === 'from'
      ? 'Select check-in date'
      : 'Select check-out date';

  function handleSave() {
    if (canSave) {
      onSave({ from: from!, to: to! });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <ListingModalHeader title={title} onClose={onClose}>
        <DatePickerHeaderText
          from={from}
          to={to}
          effectiveMinNights={effectiveMinNights}
          maxNights={maxNights}
          generalConstraintMsg={generalConstraintMsg}
        />
      </ListingModalHeader>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box sx={dayPickerThemeSx}>
          <DayPicker
            mode="range"
            selected={selected}
            onDayClick={handleDayClick}
            disabled={
              selectingPhase === 'to'
                ? buildNightDisabledMatcher(from, effectiveMinNights, maxNights)
                : { before: new Date() }
            }
            modifiers={{ restricted: restrictedMatcher }}
            modifiersStyles={{
              restricted: restrictedDayStyle(theme),
            }}
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
