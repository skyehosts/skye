'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { formatShortDateRange } from '@repo/common';
import { ListingConfirmPayModal } from './listing-confirm-pay-modal';
import { ListingDatePickerPopup } from './listing-date-picker-popup';
import { ListingGuestSelectorModal } from './listing-guest-selector-modal';
import type {
  ListingBookingStateProps,
  ListingGuestRuleProps,
} from './listing-guest-types';
import { formatGuestSummary } from './listing-guest-types';

export function ListingBookingSidebar({
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
  dateRange,
  guests,
  dateModalOpen,
  setDateModalOpen,
  guestModalOpen,
  setGuestModalOpen,
  confirmModalOpen,
  setConfirmModalOpen,
  handleDateSave,
  handleDateClear,
  handleGuestSave,
}: ListingGuestRuleProps & ListingBookingStateProps) {
  const captionSx = {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
  } as const;

  return (
    <>
      <Box sx={{ position: 'sticky', top: 24, mt: 3.75 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                £120
              </Typography>
              <Typography variant="body2" color="text.secondary">
                night
              </Typography>
            </Box>

            {/* Date selector row + popup wrapper */}
            <Box sx={{ position: 'relative' }}>
              <Box
                onClick={() => setDateModalOpen(true)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  mb: 1.5,
                  position: 'relative',
                  zIndex: dateModalOpen ? 1301 : 'auto',
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={captionSx}>
                      Check-in
                    </Typography>
                    <Typography variant="body2">
                      {dateRange
                        ? dateRange.from.toLocaleDateString()
                        : 'Add date'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5 }}>
                    <Typography variant="caption" sx={captionSx}>
                      Checkout
                    </Typography>
                    <Typography variant="body2">
                      {dateRange
                        ? dateRange.to.toLocaleDateString()
                        : 'Add date'}
                    </Typography>
                  </Box>
                </Box>

                {/* Guest selector row */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuestModalOpen(true);
                  }}
                  sx={{
                    p: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="caption" sx={captionSx}>
                    Guests
                  </Typography>
                  <Typography variant="body2">
                    {formatGuestSummary(guests)}
                  </Typography>
                </Box>
              </Box>

              {/* Desktop date picker popup */}
              <ListingDatePickerPopup
                open={dateModalOpen}
                onClose={() => setDateModalOpen(false)}
                onSave={handleDateSave}
                onClear={handleDateClear}
                initialRange={dateRange}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                if (!dateRange) {
                  setDateModalOpen(true);
                } else {
                  setConfirmModalOpen(true);
                }
              }}
              sx={{ mb: 1.5 }}
            >
              {dateRange ? 'Reserve' : 'Check availability'}
            </Button>

            {dateRange && (
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {formatShortDateRange(dateRange.from, dateRange.to)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'primary.main',
                  }}
                  onClick={() => setDateModalOpen(true)}
                >
                  Change dates
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

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
