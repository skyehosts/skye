import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type IListingImageDto } from '@repo/skye-hosts-api-client';
import type { ReactNode } from 'react';
import { ListingImageCarousel } from './listing-image-carousel';
import { ListingImageGrid } from './listing-image-grid';

interface ListingHeroImagesProps {
  images: IListingImageDto[];
  title: string;
  onBack?: () => void;
  isFavourited?: boolean;
  onFavouriteToggle?: () => void;
  isLoadingFavourite?: boolean;
  listingTitle?: string;
  favouriteButton?: ReactNode;
}

export function ListingHeroImages({
  images,
  title,
  onBack,
  isFavourited,
  onFavouriteToggle,
  isLoadingFavourite,
  listingTitle,
  favouriteButton,
}: ListingHeroImagesProps) {
  return (
    <>
      {(listingTitle || favouriteButton) && (
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          {listingTitle && (
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              {listingTitle}
            </Typography>
          )}
          {favouriteButton && <Box sx={{ ml: 'auto' }}>{favouriteButton}</Box>}
        </Box>
      )}
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <ListingImageGrid images={images} title={title} />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ListingImageCarousel
          images={images}
          title={title}
          onBack={onBack}
          isFavourited={isFavourited}
          onFavouriteToggle={onFavouriteToggle}
          isLoadingFavourite={isLoadingFavourite}
        />
      </Box>
    </>
  );
}
