import Box from '@mui/material/Box';
import {
  fetchApi,
  type IGetHomepageListingsResponseDto,
  slugify,
} from '@repo/skye-hosts-api-client';
import { HomepageListingsGrid } from '@repo/web-components/listings/homepage-listings-grid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data =
    await fetchApi<IGetHomepageListingsResponseDto>('/listing/homepage');

  return (
    <Box component="main" sx={{ py: 4, px: 3 }}>
      <HomepageListingsGrid
        listings={data.listings}
        linkWrapper={(listing, children) => (
          <Link href={`/listing/${listing.id}/${slugify(listing.title)}`}>
            {children}
          </Link>
        )}
      />
    </Box>
  );
}
