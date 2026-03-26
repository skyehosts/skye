import type { Theme } from '@mui/material/styles';
import type { DateRange } from 'react-day-picker';

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
