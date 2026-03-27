import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';
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
    '--rdp-range_middle-background-color': theme.palette.custom.driftwoodSand,
    '--rdp-range_middle-color': theme.palette.primary.main,
    '--rdp-selected-border': `2px solid ${theme.palette.primary.main}`,
    fontFamily: theme.typography.fontFamily,
  },
});

export function restrictedDayStyle(theme: Theme): CSSProperties {
  return {
    color: theme.palette.custom.rowanBerryLight,
    opacity: 0.7,
    textDecoration: 'line-through',
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
