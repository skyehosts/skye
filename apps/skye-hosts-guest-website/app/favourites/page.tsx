import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  fetchApi,
  LISTING_TYPE_LABELS,
  slugify,
  type IGetFavouritesResponseDto,
} from '@repo/skye-hosts-api-client';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { ListingThumbnail } from '@repo/web-components/listings/listing-thumbnail';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '../auth';

export const metadata: Metadata = {
  title: 'My Favourites',
  description: 'View your saved favourite listings.',
};

export default async function FavouritesPage() {
  const session = await auth();
  if (!session?.apiToken) {
    redirect('/login?callbackUrl=/favourites');
  }

  const data = await fetchApi<IGetFavouritesResponseDto>(
    '/favourite',
    undefined,
    { headers: { Authorization: `Bearer ${session.apiToken}` } },
  );

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        My Favourites
      </Typography>

      {data.favourites.length === 0 ? (
        <Typography color="text.secondary">
          You haven&apos;t saved any favourites yet. Browse{' '}
          <Link href="/">listings</Link> and tap the heart to save them here.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 215px)',
            columnGap: '12px',
            rowGap: '44px',
            justifyContent: 'start',
          }}
        >
          {data.favourites.map((fav) => (
            <Link
              key={fav.id}
              href={`/listing/${fav.listingId}/${slugify(fav.title)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box>
                <ListingThumbnail
                  coverImageUrl={fav.coverImageUrl}
                  alt={fav.title}
                />
                <Typography
                  variant="body2"
                  sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13 }}
                >
                  {LISTING_TYPE_LABELS[fav.typeId]}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: 14, mt: 0.25 }}
                >
                  {fav.title}
                </Typography>
              </Box>
            </Link>
          ))}
        </Box>
      )}
    </PageContainer>
  );
}
