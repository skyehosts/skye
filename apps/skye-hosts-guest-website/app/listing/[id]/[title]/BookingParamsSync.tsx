'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ListingBookingSidebar } from '@repo/web-components/listings/listing-booking-sidebar';
import type {
  BookingSearchParams,
  GuestCounts,
  ListingGuestRuleProps,
  ListingNightRuleProps,
} from '@repo/web-components/listings/listing-guest-types';
import { serializeBookingSearchParams } from '@repo/web-components/listings/listing-guest-types';
import { ListingMobileBookingBar } from '@repo/web-components/listings/listing-mobile-booking-bar';
import { useListingBookingState } from '@repo/web-components/listings/use-listing-booking-state';
import { useListingUnavailability } from '@repo/web-components/listings/use-listing-unavailability';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface BookingParamsSyncProps
  extends ListingGuestRuleProps, ListingNightRuleProps {
  listingId: number;
  initialBookingParams: BookingSearchParams;
}

export function BookingParamsSync({
  listingId,
  initialBookingParams,
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
  minNights,
  minNightsByCheckInDay,
  maxNights,
}: BookingParamsSyncProps) {
  const router = useRouter();
  const pathname = usePathname();

  const onBookingChange = useCallback(
    (dateRange: { from: Date; to: Date } | null, guests: GuestCounts) => {
      const params = serializeBookingSearchParams(dateRange, guests);
      const qs = new URLSearchParams(params).toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    },
    [router, pathname],
  );

  const { unavailableDates } = useListingUnavailability(listingId);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const bookingState = useListingBookingState({
    initialDateRange: initialBookingParams.dateRange,
    initialGuests: initialBookingParams.guests,
    onBookingChange,
  });

  // Listen for 'open-date-picker' events from sibling components
  useEffect(() => {
    const handler = () => bookingState.setDateModalOpen(true);
    window.addEventListener('open-date-picker', handler);
    return () => window.removeEventListener('open-date-picker', handler);
  }, [bookingState.setDateModalOpen]);

  const guestRuleProps: ListingGuestRuleProps = {
    maxGuests,
    childrenAllowed,
    infantsAllowed,
    petsAllowed,
  };

  const nightRuleProps: ListingNightRuleProps = {
    minNights,
    minNightsByCheckInDay,
    maxNights,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <Box sx={{ flex: { md: 1 }, display: { xs: 'none', md: 'block' } }}>
        <ListingBookingSidebar
          {...guestRuleProps}
          {...nightRuleProps}
          {...bookingState}
          dateModalOpen={isDesktop && bookingState.dateModalOpen}
          unavailableDates={unavailableDates}
        />
      </Box>

      {/* Mobile fixed booking bar */}
      <ListingMobileBookingBar
        {...guestRuleProps}
        {...nightRuleProps}
        {...bookingState}
        dateModalOpen={!isDesktop && bookingState.dateModalOpen}
        unavailableDates={unavailableDates}
      />
    </>
  );
}
