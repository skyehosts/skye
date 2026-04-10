import Container from '@mui/material/Container';
import { fetchApi, IGetListingResponseDto } from '@repo/skye-hosts-api-client';
import { ListingDescriptionSection } from '@repo/web-components/listings/listing-description-section';
import { ListingHeroSection } from '@repo/web-components/listings/listing-hero-section';
import type { Metadata } from 'next';

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
      <ListingDescriptionSection
        description={listing.description}
        descriptionLong={listing.descriptionLong}
        guestAccess={listing.guestAccess}
        otherDetailsToNote={listing.otherDetailsToNote}
      />
    </Container>
  );
}
