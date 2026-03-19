import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  LISTING_SPACE_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  type IListingImageDto,
  type ListingSpaceType,
  type ListingTypeId,
} from '@repo/skye-hosts-api-client';
import { ListingImageCarousel } from './listing-image-carousel';
import { ListingImageGrid } from './listing-image-grid';

export interface ListingHeroSectionProps {
  title: string;
  description: string;
  spaceType: ListingSpaceType;
  typeId: ListingTypeId;
  maxGuests: number;
  beds: number;
  bathrooms: number;
  postCode: string;
  images: IListingImageDto[];
  onBack?: () => void;
}

export function ListingHeroSection({
  title,
  description,
  spaceType,
  typeId,
  maxGuests,
  beds,
  bathrooms,
  postCode,
  images,
  onBack,
}: ListingHeroSectionProps) {
  const typeLabel = LISTING_TYPE_LABELS[typeId];
  const spaceLabel = LISTING_SPACE_TYPE_LABELS[spaceType];
  const postCodeArea = postCode.split(' ')[0] ?? postCode;

  return (
    <Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <ListingImageGrid images={images} title={title} />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ListingImageCarousel images={images} title={title} onBack={onBack} />
      </Box>

      <Box sx={{ mt: 2, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {spaceLabel} {typeLabel.toLowerCase()} in {postCodeArea}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {maxGuests} guest{maxGuests !== 1 ? 's' : ''} &middot; {beds} bed
          {beds !== 1 ? 's' : ''} &middot; {bathrooms} bathroom
          {bathrooms !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Box>
  );
}
