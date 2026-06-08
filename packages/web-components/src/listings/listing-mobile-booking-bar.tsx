'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatShortDateRange } from '@repo/common';
import { ListingDatePickerModal } from './listing-date-picker-modal';
import { ListingGuestSelectorModal } from './listing-guest-selector-modal';
import type {
  ListingBookingStateProps,
  ListingGuestRuleProps,
  ListingNightRuleProps,
} from './listing-guest-types';
import { formatGuestSummary } from './listing-guest-types';

interface ListingMobileBookingBarProps
  extends
    ListingGuestRuleProps,
    ListingNightRuleProps,
    ListingBookingStateProps {
  unavailableDates?: Set<string>;
  onReserveClick: () => void;
}

export function ListingMobileBookingBar({
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
  minNights,
  minNightsByCheckInDay,
  maxNights,
  unavailableDates,
  dateRange,
  guests,
  dateModalOpen,
  setDateModalOpen,
  guestModalOpen,
  setGuestModalOpen,
  handleDateSave,
  handleDateClear,
  handleGuestSave,
  handleGuestChange: _handleGuestChange,
  onReserveClick,
}: ListingMobileBookingBarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const ctaLinkSx = {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: 'primary.main',
    fontWeight: 600,
  } as const;

  return (
    <>
      <Box
        onClick={dateRange === null ? () => setDateModalOpen(true) : undefined}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: dateRange === null ? 'pointer' : 'default',
        }}
      >
        {dateRange === null ? (
          <>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Add dates for prices
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDateModalOpen(true);
              }}
            >
              Check availability
            </Button>
          </>
        ) : (
          <>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  £120
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  total
                </Typography>
                <Typography
                  sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 0.5 }}
                >
                  ({formatShortDateRange(dateRange.from, dateRange.to)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={ctaLinkSx}
                  onClick={() => setDateModalOpen(true)}
                >
                  Change dates
                </Typography>
                <Typography
                  variant="body2"
                  sx={ctaLinkSx}
                  onClick={() => setGuestModalOpen(true)}
                >
                  {formatGuestSummary(guests)}
                </Typography>
              </Box>
            </Box>
            <Button variant="contained" size="small" onClick={onReserveClick}>
              Reserve
            </Button>
          </>
        )}
      </Box>

      <ListingDatePickerModal
        open={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSave={handleDateSave}
        onClear={handleDateClear}
        initialRange={dateRange}
        unavailableDates={unavailableDates}
        minNights={minNights}
        minNightsByCheckInDay={minNightsByCheckInDay}
        maxNights={maxNights}
      />

      <ListingGuestSelectorModal
        open={!isDesktop && guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        onSave={handleGuestSave}
        initialGuests={guests}
        maxGuests={maxGuests}
        childrenAllowed={childrenAllowed}
        infantsAllowed={infantsAllowed}
        petsAllowed={petsAllowed}
      />
    </>
  );
}
