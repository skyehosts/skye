'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { differenceInCalendarDays, isBefore, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  DatePickerHeaderText,
  dayPickerThemeSx,
  useHoverRange,
} from './listing-date-picker-styles';
import type { ListingNightRuleProps } from './listing-guest-types';
import {
  buildNightDisabledMatcher,
  formatGeneralConstraintMessage,
  getMinNightsForDate,
  isNightCountValid,
} from './listing-guest-types';
import { ListingModalHeader, listingModalStyles } from './listing-modal-styles';

interface ListingDatePickerModalProps extends ListingNightRuleProps {
  open: boolean;
  onClose: () => void;
  onSave: (range: { from: Date; to: Date }) => void;
  onClear: () => void;
  initialRange?: { from: Date; to: Date } | null;
  unavailableDates?: Set<string>;
}

export function ListingDatePickerModal({
  open,
  onClose,
  onSave,
  onClear,
  initialRange,
  unavailableDates,
  minNights,
  minNightsByCheckInDay,
  maxNights,
}: ListingDatePickerModalProps) {
  const [from, setFrom] = useState<Date | null>(initialRange?.from ?? null);
  const [to, setTo] = useState<Date | null>(initialRange?.to ?? null);
  const [month, setMonth] = useState<Date>(initialRange?.from ?? new Date());
  const [selectingPhase, setSelectingPhase] = useState<'from' | 'to'>('from');
  const hoverRangeProps = useHoverRange(from, to);

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

  function handleDayClick(day: Date) {
    if (selectingPhase === 'from') {
      setFrom(day);
      setTo(null);
      setSelectingPhase('to');
    } else {
      if (isSameDay(day, from!)) {
        setFrom(new Date(from!.getTime()));
        return;
      }
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
    from && to ? { from, to } : from ? { from, to: from } : undefined;

  const title =
    selectingPhase === 'from'
      ? 'Select check-in date'
      : 'Select check-out date';

  function handleClear() {
    setFrom(null);
    setTo(null);
    setSelectingPhase('from');
    onClear();
  }

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
            onSelect={() => {}}
            onDayClick={handleDayClick}
            {...hoverRangeProps}
            disabled={
              selectingPhase === 'to'
                ? buildNightDisabledMatcher(
                    from,
                    effectiveMinNights,
                    maxNights,
                    unavailableDates,
                  )
                : buildNightDisabledMatcher(null, 1, null, unavailableDates)
            }
            numberOfMonths={1}
            month={month}
            onMonthChange={setMonth}
          />
        </Box>
      </DialogContent>
      <Box sx={listingModalStyles.bottomBar}>
        {hasFrom ? (
          <Typography
            variant="body2"
            onClick={handleClear}
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: 'primary.main',
            }}
          >
            Clear dates
          </Typography>
        ) : (
          <Box />
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!canSave} onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
