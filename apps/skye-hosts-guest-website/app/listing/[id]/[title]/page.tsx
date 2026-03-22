import Container from '@mui/material/Container';
import {
  fetchApi,
  type IGetListingResponseDto,
  type IToggleFavouriteResponseDto,
} from '@repo/skye-hosts-api-client';
import { ListingHeroSection } from '@repo/web-components/listings/listing-hero-section';
import { ListingLocationSection } from '@repo/web-components/listings/listing-location-section';
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '../../../auth';
import { BookNowButton } from './BookNowButton';
import { FavouriteButton } from './FavouriteButton';

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

  let isFavourited = false;
  if (session?.apiToken) {
    try {
      const favCheck = await fetchApi<IToggleFavouriteResponseDto>(
        `/favourite/check/${listing.id}`,
        undefined,
        { headers: { Authorization: `Bearer ${session.apiToken}` } },
      );
      isFavourited = favCheck.isFavourited;
    } catch {
      // Fail silently — favourite state will default to false
    }
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1120, px: { xs: 0, md: 3 } }}>
      <ListingHeroSection
        title={listing.title}
        description={listing.description}
        spaceType={listing.spaceType}
        typeId={listing.typeId}
        maxGuests={listing.maxGuests}
        beds={listing.beds}
        bathrooms={listing.bathrooms}
        postCode={listing.postCode}
        images={listing.images}
      />
      <ListingLocationSection
        approximateLatitude={listing.approximateLatitude}
        approximateLongitude={listing.approximateLongitude}
        googleMapsStaticApiKey={
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY ?? ''
        }
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''}
      />
      {/* TODO: Replace hardcoded values with actual booking form data */}
      {guestId ? (
        <>
          <FavouriteButton
            listingId={listing.id}
            initialFavourited={isFavourited}
          />
          <BookNowButton
            listingId={listing.id}
            guestId={guestId}
            checkInDate="2026-04-01"
            checkOutDate="2026-04-05"
            totalPrice={500}
          />
        </>
      ) : (
        <Link href={`/login?callbackUrl=/listing/${id}/${title}`}>
          Log in to book
        </Link>
      )}
    </Container>
  );
}
