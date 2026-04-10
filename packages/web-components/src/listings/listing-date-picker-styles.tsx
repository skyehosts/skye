import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  formatLongDate,
  formatNightConstraintMessage,
} from './listing-guest-types';

export function toDateRange(
  range: { from: Date; to: Date } | null | undefined,
): DateRange | undefined {
  return range ? { from: range.from, to: range.to } : undefined;
}

export const dayPickerThemeSx = (theme: Theme) => ({
  '& .rdp-root': {
    '--rdp-accent-color': theme.palette.custom.seaGlassTeal,
    '--rdp-accent-background-color': theme.palette.custom.driftwoodSand,
    '--rdp-today-color': theme.palette.custom.heatherPurple,
    '--rdp-range_start-date-background-color': theme.palette.primary.main,
    '--rdp-range_start-color': '#fff',
    '--rdp-range_end-date-background-color': theme.palette.primary.main,
    '--rdp-range_end-color': '#fff',
    '--rdp-range_middle-background-color': '#f7f7f7',
    '--rdp-range_middle-color': theme.palette.primary.main,
    '--rdp-selected-border': `2px solid ${theme.palette.primary.main}`,
    fontFamily: theme.typography.fontFamily,
  },
  '& .rdp-month_caption': {
    fontFamily: theme.typography.fontFamilyHeading,
  },
  '& .rdp-day_button': {
    borderRadius: '50%',
    border: '2px solid transparent',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  },
  '& .rdp-day:not(.rdp-disabled):not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button:hover':
    {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  '& .rdp-hover-range:not(.rdp-range_start):not(.rdp-hover-range-end)': {
    backgroundColor: '#f7f7f7',
  },
  '& .rdp-hover-range-end .rdp-day_button': {
    backgroundColor: '#f7f7f7',
    borderRadius: '50%',
  },
  '& .rdp-disabled .rdp-day_button': {
    color: theme.palette.text.disabled,
    textDecoration: 'line-through',
  },
});

export function useHoverRange(from: Date | null, to: Date | null) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const hasFrom = from != null;
  const hasRange = from != null && to != null;

  const hoverRangeDates =
    hasFrom && !hasRange && hoveredDate && isAfter(hoveredDate, from!)
      ? eachDayOfInterval({ start: from!, end: hoveredDate }).slice(1)
      : [];

  return {
    onDayMouseEnter: (day: Date) => setHoveredDate(day),
    onDayMouseLeave: () => setHoveredDate(null),
    modifiers: {
      hoverRange: hoverRangeDates,
      hoverRangeEnd:
        hoveredDate && hoverRangeDates.length > 0 ? [hoveredDate] : [],
    },
    modifiersClassNames: {
      hoverRange: 'rdp-hover-range',
      hoverRangeEnd: 'rdp-hover-range-end',
    },
  };
}

interface DatePickerHeaderTextProps {
  from: Date | null;
  to: Date | null;
  effectiveMinNights: number;
  maxNights: number | null;
  generalConstraintMsg: string | null;
}

export function DatePickerHeaderText({
  from,
  to,
  effectiveMinNights,
  maxNights,
  generalConstraintMsg,
}: DatePickerHeaderTextProps) {
  const hasFrom = from != null;
  const hasRange = from != null && to != null;

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {hasRange
          ? `${formatLongDate(from!)} – ${formatLongDate(to!)}`
          : hasFrom
            ? `${formatLongDate(from!)} – ...`
            : 'Add your travel dates for exact pricing'}
      </Typography>
      {hasFrom && !hasRange ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontStyle: 'italic' }}
        >
          {formatNightConstraintMessage(effectiveMinNights, maxNights)}
        </Typography>
      ) : (
        !hasRange &&
        generalConstraintMsg && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontStyle: 'italic' }}
          >
            {generalConstraintMsg}
          </Typography>
        )
      )}
    </>
  );
}
