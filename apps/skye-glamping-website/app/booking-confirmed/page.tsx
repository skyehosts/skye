import {
  fetchApi,
  type IGetListingResponseDto,
} from '@repo/skye-hosts-api-client';
import { BookingConfirmedPage } from '@repo/web-components/booking/booking-confirmed-page';
import { buildLoginRedirect } from '@repo/web-components/booking/booking-params';
import { toDateOnly } from '@repo/web-components/listings/listing-guest-types';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '../auth';

interface BookingConfirmedPageProps {
  searchParams: Promise<{
    listingId?: string;
    checkin?: string;
    checkout?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Booking confirmed',
  robots: { index: false, follow: false },
  alternates: { canonical: '/booking-confirmed' },
};

export default async function BookingConfirmedRoute({
  searchParams,
}: BookingConfirmedPageProps) {
  const { listingId, checkin, checkout } = await searchParams;

  if (!listingId || !checkin || !checkout) notFound();

  const checkinDate = toDateOnly(checkin);
  const checkoutDate = toDateOnly(checkout);
  if (!checkinDate || !checkoutDate) notFound();

  const [session, listing] = await Promise.all([
    auth(),
    fetchApi<IGetListingResponseDto>(`/listing/${listingId}`),
  ]);

  if (!session?.user) {
    const qs = new URLSearchParams({ listingId, checkin, checkout }).toString();
    redirect(buildLoginRedirect(`/booking-confirmed?${qs}`));
  }

  return (
    <BookingConfirmedPage
      listing={listing}
      checkin={checkinDate}
      checkout={checkoutDate}
    />
  );
}
