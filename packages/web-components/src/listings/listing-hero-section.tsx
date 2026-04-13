'use client';

import StarIcon from '@mui/icons-material/Star';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  LISTING_SPACE_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  type IListingImageDto,
  type ListingSpaceType,
  type ListingTypeId,
} from '@repo/skye-hosts-api-client';
import { ListingHeroImages } from './listing-hero-images';

export interface ListingReviewSummary {
  rating: number;
  reviewCount: number;
}

export interface ListingHostInfo {
  name: string;
  avatarUrl?: string;
}

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
  hideImages?: boolean;
  reviewSummary?: ListingReviewSummary;
  hostInfo?: ListingHostInfo;
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
  hideImages,
  reviewSummary,
  hostInfo,
}: ListingHeroSectionProps) {
  const typeLabel = LISTING_TYPE_LABELS[typeId];
  const spaceLabel = LISTING_SPACE_TYPE_LABELS[spaceType];
  const postCodeArea = postCode.split(' ')[0] ?? postCode;
  const responsiveJustify = { xs: 'center', md: 'flex-start' } as const;

  return (
    <Box>
      {!hideImages && (
        <ListingHeroImages images={images} title={title} onBack={onBack} />
      )}

      <Box sx={{ mt: 3.75, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            fontSize: 26,
            display: { xs: 'block', md: 'none' },
            color: 'custom.grey950',
          }}
        >
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
        {reviewSummary && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mt: 0.5, justifyContent: responsiveJustify }}
          >
            <StarIcon sx={{ color: 'custom.whiskyGold', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {reviewSummary.rating.toFixed(2)} &middot;{' '}
              {reviewSummary.reviewCount} review
              {reviewSummary.reviewCount !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        )}
        {hostInfo && (
          <Box
            sx={{
              mt: 2,
              py: 2,
              borderTop: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ justifyContent: responsiveJustify }}
            >
              <Avatar
                src={hostInfo.avatarUrl}
                sx={{ width: 50, height: 50, bgcolor: 'custom.warmStone' }}
              />
              <Typography
                variant="body1"
                sx={(theme) => ({
                  fontFamily: theme.typography.fontFamilyHeading,
                  fontWeight: 600,
                  color: 'custom.grey950',
                })}
              >
                Hosted by {hostInfo.name}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
