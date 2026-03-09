import { fetchApi, IGetListingResponseDto } from '@repo/book-skye-api-client';
import type { Metadata } from 'next';
import { auth } from '../../../auth';
import { BookNowButton } from './BookNowButton';

interface ListingPageProps {
  params: Promise<{ id: string; title: string }>;
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);

  return {
    title: listing.title,
    description: listing.description?.slice(0, 160),
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
  const session = await auth();
  const guestId = session?.user?.id ? Number(session.user.id) : null;

  return (
    <div>
      <h1>{listing.title}</h1>
      <pre>{JSON.stringify(listing, null, 2)}</pre>
      {/* TODO: Replace hardcoded values with actual booking form data */}
      {guestId && (
        <BookNowButton
          listingId={listing.id}
          guestId={guestId}
          checkInAt="2026-04-01"
          checkOutAt="2026-04-05"
          totalPrice={500}
        />
      )}
    </div>
  );
}
