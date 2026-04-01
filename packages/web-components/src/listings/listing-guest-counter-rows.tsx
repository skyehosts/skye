'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { GuestCounts, GuestRow } from './listing-guest-types';

interface GuestCounterRowsProps {
  counts: GuestCounts;
  rows: GuestRow[];
  onChangeKey: (key: keyof GuestCounts, delta: number) => void;
}

export function GuestCounterRows({
  counts,
  rows,
  onChangeKey,
}: GuestCounterRowsProps) {
  return (
    <>
      {rows.map((row) => {
        const max = row.getMax(counts);
        const min = row.getMin();
        const value = counts[row.key];
        const disableMinus = value <= min;
        const disablePlus = value >= max;

        return (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {row.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.subtitle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                disabled={disableMinus}
                onClick={() => onChangeKey(row.key, -1)}
                sx={{ opacity: disableMinus ? 0.3 : 1 }}
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
              <Typography
                sx={{ minWidth: 24, textAlign: 'center', fontWeight: 500 }}
              >
                {value}
              </Typography>
              <IconButton
                size="small"
                disabled={disablePlus}
                onClick={() => onChangeKey(row.key, 1)}
                sx={{ opacity: disablePlus ? 0.3 : 1 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </>
  );
}
