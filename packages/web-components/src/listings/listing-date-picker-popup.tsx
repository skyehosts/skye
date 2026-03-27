'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { differenceInCalendarDays, isBefore, isSameDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
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

interface ListingDatePickerPopupProps extends ListingNightRuleProps {
  open: boolean;
  onClose: () => void;
  onSave: (range: { from: Date; to: Date }) => void;
  onClear: () => void;
  initialRange?: { from: Date; to: Date } | null;
  externalFrom?: Date | null;
  externalTo?: Date | null;
}

export function ListingDatePickerPopup({
  open,
  onClose,
  onSave,
  onClear,
  initialRange,
  externalFrom,
  externalTo,
  minNights,
  minNightsByCheckInDay,
  maxNights,
}: ListingDatePickerPopupProps) {
  const theme = useTheme();
  const [from, setFrom] = useState<Date | null>(initialRange?.from ?? null);
  const [to, setTo] = useState<Date | null>(initialRange?.to ?? null);
  const [month, setMonth] = useState<Date>(initialRange?.from ?? new Date());
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 'from' = waiting for check-in click, 'to' = waiting for check-out click
  const [selectingPhase, setSelectingPhase] = useState<'from' | 'to'>('from');

  useEffect(() => {
    if (open) {
      setFrom(initialRange?.from ?? null);
      setTo(initialRange?.to ?? null);
      setMonth(initialRange?.from ?? new Date());
      setSelectingPhase('from');
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [open, initialRange]);

  // Sync when external fields (typed inputs) change while popup is open.
  // Only react to non-null values to avoid overwriting popup-initiated state.
  const prevExternalFrom = useRef(externalFrom);
  const prevExternalTo = useRef(externalTo);

  useEffect(() => {
    if (!open) return;
    if (
      externalFrom != null &&
      externalFrom.getTime() !== prevExternalFrom.current?.getTime()
    ) {
      setFrom(externalFrom);
      setMonth(externalFrom);
      setSelectingPhase('to');
    }
    prevExternalFrom.current = externalFrom;
  }, [open, externalFrom]);

  useEffect(() => {
    if (!open) return;
    if (
      externalTo != null &&
      externalTo.getTime() !== prevExternalTo.current?.getTime()
    ) {
      setTo(externalTo);
    }
    prevExternalTo.current = externalTo;
  }, [open, externalTo]);

  const effectiveMinNights =
    from != null
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
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

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
      autoSaveTimer.current = setTimeout(() => {
        onSave({ from: from!, to: day });
      }, 300);
    }
  }

  function handleClear() {
    setFrom(null);
    setTo(null);
    setSelectingPhase('from');
    onClear();
  }

  if (!open) return null;

  const selected: DateRange | undefined =
    from && to ? { from, to } : from ? { from, to: undefined } : undefined;

  const hasFrom = from != null;
  const hasRange = from != null && to != null;
  const numberOfNights = hasRange ? differenceInCalendarDays(to!, from!) : null;

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

      {/* Popup — form fields sit at its top-right via higher z-index */}
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          zIndex: 1300,
          width: 700,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {hasRange
              ? `${numberOfNights} night${numberOfNights !== 1 ? 's' : ''}`
              : 'Select dates'}
          </Typography>
          <DatePickerHeaderText
            from={from}
            to={to}
            effectiveMinNights={effectiveMinNights}
            maxNights={maxNights}
            generalConstraintMsg={generalConstraintMsg}
          />
        </Box>

        {/* Calendar */}
        <Box
          sx={[
            {
              display: 'flex',
              justifyContent: 'center',
              px: 3,
              pt: 2.5,
              pb: 2,
              '& .rdp-months': { flexWrap: 'nowrap' },
            },
            dayPickerThemeSx,
          ]}
        >
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
            numberOfMonths={2}
            month={month}
            onMonthChange={setMonth}
          />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            pb: 2,
          }}
        >
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
          <Button variant="text" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Paper>
    </>
  );
}
