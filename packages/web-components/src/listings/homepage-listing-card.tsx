'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  LISTING_HIGHLIGHT_LABELS,
  LISTING_TYPE_LABELS,
  type IHomepageListingDto,
} from '@repo/skye-hosts-api-client';

import { ListingThumbnail } from './listing-thumbnail';

interface HomepageListingCardProps {
  listing: IHomepageListingDto;
}

export function HomepageListingCard({ listing }: HomepageListingCardProps) {
  const typeLabel = LISTING_TYPE_LABELS[listing.typeId];
  const firstHighlight = listing.highlights[0]
    ? LISTING_HIGHLIGHT_LABELS[listing.highlights[0]]
    : null;

  return (
    <Box>
      <ListingThumbnail
        coverImageUrl={listing.coverImageUrl}
        alt={listing.title}
      />
      <Typography
        variant="body2"
        sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13 }}
      >
        {typeLabel} in Suburb
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 0.25,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
          £123/night
        </Typography>
        {firstHighlight && (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: 12 }}
          >
            {firstHighlight}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
