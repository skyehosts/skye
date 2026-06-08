import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {
  fetchApi,
  type IGetAmenitiesResponseDto,
  type IGetListingResponseDto,
  type IToggleFavouriteResponseDto,
} from '@repo/skye-hosts-api-client';
import { ListingAmenitiesSection } from '@repo/web-components/listings/listing-amenities-section';
import { ListingDescriptionSection } from '@repo/web-components/listings/listing-description-section';
import { parseBookingSearchParams } from '@repo/web-components/listings/listing-guest-types';
import { ListingHeroImages } from '@repo/web-components/listings/listing-hero-images';
import { ListingHeroSection } from '@repo/web-components/listings/listing-hero-section';
import { ListingLocationSection } from '@repo/web-components/listings/listing-location-section';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { auth } from '../../../auth';
import { BookingParamsSync } from './BookingParamsSync';
import { ListingHeroWithFavourite } from './ListingHeroWithFavourite';
import { ListingThingsToKnowWithDates } from './ListingThingsToKnowWithDates';

interface ListingPageProps {
  params: Promise<{ id: string; title: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
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

export default async function ListingPage({
  params,
  searchParams,
}: ListingPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const [listing, amenitiesData] = await Promise.all([
    fetchApi<IGetListingResponseDto>(`/listing/${id}`),
    fetchApi<IGetAmenitiesResponseDto>('/listing/amenities'),
  ]);
  const session = await auth();
  const guestId = session?.user?.id ? Number(session.user.id) : null;
  const initialBookingParams = parseBookingSearchParams(resolvedSearchParams);

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
          <ListingDescriptionSection
            description={listing.description}
            descriptionLong={listing.descriptionLong}
            guestAccess={listing.guestAccess}
            otherDetailsToNote={listing.otherDetailsToNote}
          />
          <ListingAmenitiesSection
            amenityIds={listing.amenities}
            categories={amenitiesData.categories}
          />
          <Suspense>
            <ListingThingsToKnowWithDates listing={listing} />
          </Suspense>
        </Box>

        {/* Right column: booking sidebar (desktop) + mobile bar — via BookingParamsSync */}
        <BookingParamsSync
          listingId={listing.id}
          listingTitle={listing.title}
          initialBookingParams={initialBookingParams}
          maxGuests={listing.maxGuests}
          childrenAllowed={listing.houseRuleChildrenAllowed}
          infantsAllowed={listing.houseRuleInfantsAllowed}
          petsAllowed={listing.houseRulePetsAllowed ?? true}
          minNights={listing.minNights}
          minNightsByCheckInDay={listing.minNightsByCheckInDay}
          maxNights={listing.maxNights}
        />
      </Box>

      <Box sx={{ px: { xs: 2, md: 0 } }}>
        <ListingLocationSection
          approximateLatitude={listing.approximateLatitude}
          approximateLongitude={listing.approximateLongitude}
          googleMapsStaticApiKey={
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY ?? ''
          }
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''}
          listingTitle={listing.title}
        />
      </Box>

      {/* TEMP: filler content to enable scrolling past the map (remove before merge) */}
      <Box
        sx={{
          height: 1600,
          mx: { xs: 2, md: 0 },
          mt: 4,
          bgcolor: 'custom.driftwoodSand',
          borderRadius: 1,
        }}
      />
    </Container>
  );
}
