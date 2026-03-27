'use client';

import Box from '@mui/material/Box';
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
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface BookingParamsSyncProps
  extends ListingGuestRuleProps, ListingNightRuleProps {
  initialBookingParams: BookingSearchParams;
}

export function BookingParamsSync({
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

  const bookingState = useListingBookingState({
    initialDateRange: initialBookingParams.dateRange,
    initialGuests: initialBookingParams.guests,
    onBookingChange,
  });

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
        />
      </Box>

      {/* Mobile fixed booking bar */}
      <ListingMobileBookingBar
        {...guestRuleProps}
        {...nightRuleProps}
        {...bookingState}
      />
    </>
  );
}
