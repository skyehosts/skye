import {
  fetchApi,
  type IGetListingResponseDto,
} from '@repo/skye-hosts-api-client';
import { BookingPage } from '@repo/web-components/booking/booking-page';
import { buildBookLoginRedirect } from '@repo/web-components/booking/booking-params';
import { parseBookingSearchParams } from '@repo/web-components/listings/listing-guest-types';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '../../../auth';

interface BookPageProps {
  params: Promise<{ id: string; title: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { id, title } = await params;
  return {
    title: 'Confirm and pay',
    robots: { index: false, follow: false },
    alternates: { canonical: `/book/${id}/${title}` },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: BookPageProps) {
  const { id, title } = await params;
  const resolvedSearchParams = await searchParams;

  const [session, listing] = await Promise.all([
    auth(),
    fetchApi<IGetListingResponseDto>(`/listing/${id}`),
  ]);

  if (!session?.user) {
    redirect(buildBookLoginRedirect(id, title, resolvedSearchParams));
  }

  const { dateRange, guests } = parseBookingSearchParams(resolvedSearchParams);

  return (
    <BookingPage
      listing={listing}
      initialDateRange={dateRange}
      initialGuests={guests}
      guestId={Number(session.user.id)}
    />
  );
}
