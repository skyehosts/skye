import Box from '@mui/material/Box';
import type { IHomepageListingDto } from '@repo/skye-hosts-api-client';
import type { ReactNode } from 'react';

import { HomepageListingCard } from './homepage-listing-card';

interface HomepageListingsGridProps {
  listings: IHomepageListingDto[];
  linkWrapper: (listing: IHomepageListingDto, children: ReactNode) => ReactNode;
}

export function HomepageListingsGrid({
  listings,
  linkWrapper,
}: HomepageListingsGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 215px)',
        maxWidth: 215 * 7 + 12 * 6,
        columnGap: '12px',
        rowGap: '44px',
        justifyContent: 'start',
      }}
    >
      {listings.map((listing) => (
        <Box key={listing.id}>
          {linkWrapper(listing, <HomepageListingCard listing={listing} />)}
        </Box>
      ))}
    </Box>
  );
}
