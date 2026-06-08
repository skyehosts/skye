'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { IGetListingResponseDto } from '@repo/skye-hosts-api-client';
import { slugify } from '@repo/skye-hosts-api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ListingCancellationPolicyModal } from '../listings/listing-cancellation-policy-modal';
import { ListingDatePickerModal } from '../listings/listing-date-picker-modal';
import { ListingGuestSelectorModal } from '../listings/listing-guest-selector-modal';
import {
  type GuestCounts,
  serializeBookingSearchParams,
} from '../listings/listing-guest-types';
import { useListingBookingState } from '../listings/use-listing-booking-state';
import { buildBookingUrl, parseBookingStep } from './booking-params';
import { BookingPaymentSection } from './booking-payment-section';
import { BookingReviewSection } from './booking-review-section';
import { BookingWizard } from './booking-wizard';
import { useQuote } from './use-quote';

export interface BookingPageProps {
  listing: IGetListingResponseDto;
  initialDateRange: { from: Date; to: Date } | null;
  initialGuests: GuestCounts;
  guestId: number;
}

export function BookingPage({
  listing,
  initialDateRange,
  initialGuests,
  guestId,
}: BookingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const step = parseBookingStep(searchParams.get('step'));

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);

  const booking = useListingBookingState({
    initialDateRange,
    initialGuests,
    onBookingChange: (dateRange, guests) => {
      const url = buildBookingUrl({
        listingId: listing.id,
        listingTitle: listing.title,
        dateRange,
        guests,
        step: step === 'payment' ? 'payment' : undefined,
      });
      router.replace(url, { scroll: false });
    },
  });

  const quote = useQuote({
    listingId: listing.id,
    dateRange: booking.dateRange,
    guests: booking.guests,
  });

  const listingUrl = `/listing/${listing.id}/${slugify(listing.title)}`;

  const handleCloseWizard = () => {
    const qs = new URLSearchParams(
      serializeBookingSearchParams(booking.dateRange, booking.guests),
    ).toString();
    router.push(qs ? `${listingUrl}?${qs}` : listingUrl);
  };

  const handleNext = () => {
    if (step === 'review') {
      router.push(
        buildBookingUrl({
          listingId: listing.id,
          listingTitle: listing.title,
          dateRange: booking.dateRange,
          guests: booking.guests,
          step: 'payment',
        }),
        { scroll: false },
      );
    }
    // TODO: Confirm booking action on step=payment
  };

  const handleBack = () => {
    router.replace(
      buildBookingUrl({
        listingId: listing.id,
        listingTitle: listing.title,
        dateRange: booking.dateRange,
        guests: booking.guests,
      }),
      { scroll: false },
    );
  };

  const reviewSection = (
    <BookingReviewSection
      listingTitle={listing.title}
      coverImageUrl={listing.coverImageUrl}
      cancellationPolicy={listing.cancellationPolicyShortTerm}
      checkInTimeStart={listing.checkInTimeStart}
      dateRange={booking.dateRange}
      guests={booking.guests}
      onChangeDates={() => booking.setDateModalOpen(true)}
      onChangeGuests={() => booking.setGuestModalOpen(true)}
      onOpenCancellationPolicy={() => setCancellationModalOpen(true)}
    />
  );

  const paymentSection = (
    <BookingPaymentSection
      quote={quote}
      listingId={listing.id}
      guestId={guestId}
      dateRange={booking.dateRange}
    />
  );

  return (
    <>
      {isMobile ? (
        <BookingWizard
          step={step}
          onClose={handleCloseWizard}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!booking.dateRange}
        >
          {step === 'review' ? reviewSection : paymentSection}
        </BookingWizard>
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton
              onClick={() => router.push(listingUrl)}
              size="small"
              aria-label="Back to listing"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              component="h1"
              sx={{ fontSize: '2rem', fontWeight: 600 }}
            >
              Confirm and pay
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { md: 'minmax(0, 1fr) 370px' },
              gap: 5,
              alignItems: 'start',
            }}
          >
            {reviewSection}
            <Box sx={{ position: 'sticky', top: 24 }}>{paymentSection}</Box>
          </Box>
        </Container>
      )}

      <ListingDatePickerModal
        open={booking.dateModalOpen}
        onClose={() => booking.setDateModalOpen(false)}
        onSave={booking.handleDateSave}
        onClear={booking.handleDateClear}
        initialRange={booking.dateRange}
        minNights={listing.minNights}
        minNightsByCheckInDay={listing.minNightsByCheckInDay}
        maxNights={listing.maxNights}
      />

      <ListingGuestSelectorModal
        open={booking.guestModalOpen}
        onClose={() => booking.setGuestModalOpen(false)}
        onSave={booking.handleGuestSave}
        initialGuests={booking.guests}
        maxGuests={listing.maxGuests}
        childrenAllowed={listing.houseRuleChildrenAllowed}
        infantsAllowed={listing.houseRuleInfantsAllowed}
        petsAllowed={listing.houseRulePetsAllowed ?? false}
      />

      {booking.dateRange && (
        <ListingCancellationPolicyModal
          open={cancellationModalOpen}
          onClose={() => setCancellationModalOpen(false)}
          policy={listing.cancellationPolicyShortTerm}
          checkInDate={booking.dateRange.from}
          checkInTimeStart={listing.checkInTimeStart}
          fullScreen={isMobile}
        />
      )}
    </>
  );
}
