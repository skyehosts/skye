'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { formatShortDateRange } from '@repo/common';
import { ListingConfirmPayModal } from './listing-confirm-pay-modal';
import { ListingDatePickerModal } from './listing-date-picker-modal';
import { ListingGuestSelectorModal } from './listing-guest-selector-modal';
import type { ListingGuestRuleProps } from './listing-guest-types';
import { formatGuestSummary } from './listing-guest-types';
import { useListingBookingState } from './use-listing-booking-state';

export function ListingMobileBookingBar({
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
}: ListingGuestRuleProps) {
  const {
    dateRange,
    guests,
    dateModalOpen,
    setDateModalOpen,
    guestModalOpen,
    setGuestModalOpen,
    confirmModalOpen,
    setConfirmModalOpen,
    handleDateSave,
    handleGuestSave,
  } = useListingBookingState();

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
                  variant="body2"
                  sx={{ color: 'text.secondary', ml: 0.5 }}
                >
                  ({formatShortDateRange(dateRange.from, dateRange.to)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'primary.main',
                  }}
                  onClick={() => setDateModalOpen(true)}
                >
                  Change dates
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'primary.main',
                  }}
                  onClick={() => setGuestModalOpen(true)}
                >
                  {formatGuestSummary(guests)}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={() => setConfirmModalOpen(true)}
            >
              Reserve
            </Button>
          </>
        )}
      </Box>

      <ListingDatePickerModal
        open={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSave={handleDateSave}
        initialRange={dateRange}
      />

      <ListingGuestSelectorModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        onSave={handleGuestSave}
        initialGuests={guests}
        maxGuests={maxGuests}
        childrenAllowed={childrenAllowed}
        infantsAllowed={infantsAllowed}
        petsAllowed={petsAllowed}
      />

      <ListingConfirmPayModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
      />
    </>
  );
}
