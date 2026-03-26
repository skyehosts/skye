import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {
  fetchApi,
  type IGetListingResponseDto,
  type IToggleFavouriteResponseDto,
} from '@repo/skye-hosts-api-client';
import { ListingBookingSidebar } from '@repo/web-components/listings/listing-booking-sidebar';
import { ListingHeroImages } from '@repo/web-components/listings/listing-hero-images';
import { ListingHeroSection } from '@repo/web-components/listings/listing-hero-section';
import { ListingLocationSection } from '@repo/web-components/listings/listing-location-section';
import { ListingMobileBookingBar } from '@repo/web-components/listings/listing-mobile-booking-bar';
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '../../../auth';
import { BookNowButton } from './BookNowButton';
import { ListingHeroWithFavourite } from './ListingHeroWithFavourite';

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
    <Container
      maxWidth={false}
      sx={{ maxWidth: 1120, px: { xs: 0, md: 3 }, pb: { xs: 10, md: 0 } }}
    >
      {/* Full-width images — guest: interactive favourite; logged-out: static */}
      {guestId ? (
        <ListingHeroWithFavourite
          images={listing.images}
          title={listing.title}
          listingTitle={listing.title}
          listingId={listing.id}
          initialFavourited={isFavourited}
        />
      ) : (
        <ListingHeroImages
          images={listing.images}
          title={listing.title}
          listingTitle={listing.title}
        />
      )}

      {/* Two-column layout: hero text + sidebar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { md: 4 },
          px: { xs: 2, md: 0 },
        }}
      >
        {/* Left column: hero text + location + booking actions */}
        <Box sx={{ flex: { md: '0 0 62%' }, minWidth: 0 }}>
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
            hideImages
            reviewSummary={{ rating: 4.85, reviewCount: 12 }}
            hostInfo={{
              name: listing.hostName,
              avatarUrl: listing.hostProfilePhotoUrl ?? undefined,
            }}
          />
          <ListingLocationSection
            approximateLatitude={listing.approximateLatitude}
            approximateLongitude={listing.approximateLongitude}
            googleMapsStaticApiKey={
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY ?? ''
            }
            mapboxAccessToken={
              process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''
            }
            listingTitle={listing.title}
          />
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
        </Box>

        {/* Right column: booking sidebar (desktop only) */}
        <Box sx={{ flex: { md: 1 }, display: { xs: 'none', md: 'block' } }}>
          <ListingBookingSidebar />
        </Box>
      </Box>

      {/* Mobile fixed booking bar */}
      <ListingMobileBookingBar />
    </Container>
  );
}
