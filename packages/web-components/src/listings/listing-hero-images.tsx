import Box from '@mui/material/Box';
import { type IListingImageDto } from '@repo/skye-hosts-api-client';
import { ListingImageCarousel } from './listing-image-carousel';
import { ListingImageGrid } from './listing-image-grid';

interface ListingHeroImagesProps {
  images: IListingImageDto[];
  title: string;
  onBack?: () => void;
}

export function ListingHeroImages({
  images,
  title,
  onBack,
}: ListingHeroImagesProps) {
  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <ListingImageGrid images={images} title={title} />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ListingImageCarousel images={images} title={title} onBack={onBack} />
      </Box>
    </>
  );
}
