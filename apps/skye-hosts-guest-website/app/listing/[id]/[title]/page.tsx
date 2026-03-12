import { fetchApi, IGetListingResponseDto } from '@repo/skye-hosts-api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
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
  const { id, title } = await params;
  const listing = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
  const session = await auth();
  const guestId = session?.user?.id ? Number(session.user.id) : null;

  return (
    <div>
      <h1>{listing.title}</h1>
      <pre>{JSON.stringify(listing, null, 2)}</pre>
      {/* TODO: Replace hardcoded values with actual booking form data */}
      {guestId ? (
        <BookNowButton
          listingId={listing.id}
          guestId={guestId}
          checkInDate="2026-04-01"
          checkOutDate="2026-04-05"
          totalPrice={500}
        />
      ) : (
        <Link href={`/login?callbackUrl=/listing/${id}/${title}`}>
          Log in to book
        </Link>
      )}
    </div>
  );
}
