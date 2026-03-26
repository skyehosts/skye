'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  differenceInCalendarDays,
  format,
  isBefore,
  isSameDay,
} from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { dayPickerThemeSx } from './listing-date-picker-styles';

interface ListingDatePickerPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (range: { from: Date; to: Date }) => void;
  onClear: () => void;
  initialRange?: { from: Date; to: Date } | null;
}

function formatLongDate(date: Date): string {
  return format(date, 'd MMMM yyyy');
}

export function ListingDatePickerPopup({
  open,
  onClose,
  onSave,
  onClear,
  initialRange,
}: ListingDatePickerPopupProps) {
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

  function handleDayClick(day: Date) {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    if (selectingPhase === 'from') {
      // Selecting check-in: set from, clear to, advance to 'to' phase
      setFrom(day);
      setTo(null);
      setSelectingPhase('to');
    } else {
      // Selecting check-out
      if (isSameDay(day, from!)) {
        // Clicked same day as check-in — ignore
        return;
      }
      if (isBefore(day, from!)) {
        // Clicked before check-in — treat as new check-in instead
        setFrom(day);
        setTo(null);
        return;
      }
      // Valid check-out
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

  // Build the selected range for rdp visual highlighting
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

      {/* Popup */}
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          right: 0,
          top: '100%',
          zIndex: 1300,
          width: 700,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: 3,
          mt: 1,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            px: 3,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {hasRange
                ? `${numberOfNights} night${numberOfNights !== 1 ? 's' : ''}`
                : 'Select dates'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasRange
                ? `${formatLongDate(from!)} – ${formatLongDate(to!)}`
                : hasFrom
                  ? `${formatLongDate(from!)} – ...`
                  : 'Add your travel dates for exact pricing'}
            </Typography>
          </Box>
          {hasFrom && (
            <Typography
              variant="body2"
              onClick={handleClear}
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: 'primary.main',
                mt: 0.5,
                flexShrink: 0,
              }}
            >
              Clear dates
            </Typography>
          )}
        </Box>

        {/* Calendar */}
        <Box
          sx={[
            {
              display: 'flex',
              justifyContent: 'center',
              px: 3,
              pb: 3,
              '& .rdp-months': { flexWrap: 'nowrap' },
            },
            dayPickerThemeSx,
          ]}
        >
          <DayPicker
            mode="range"
            selected={selected}
            onDayClick={handleDayClick}
            disabled={{ before: new Date() }}
            numberOfMonths={2}
            month={month}
            onMonthChange={setMonth}
          />
        </Box>
      </Paper>
    </>
  );
}
