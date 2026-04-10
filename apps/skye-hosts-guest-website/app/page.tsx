import {
  type IGetHomepageListingsResponseDto,
  slugify,
} from '@repo/skye-hosts-api-client';
import { CONTENT_MAX_WIDTH } from '@repo/web-components/layout/layout-constants';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { HomepageListingsGrid } from '@repo/web-components/listings/homepage-listings-grid';
import Link from 'next/link';

import { fetchApi } from '../../../packages/skye-hosts-api-client/src';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data =
    await fetchApi<IGetHomepageListingsResponseDto>('/listing/homepage');

  return (
    <PageContainer maxWidth={CONTENT_MAX_WIDTH}>
      <HomepageListingsGrid
        listings={data.listings}
        linkWrapper={(listing, children) => (
          <Link href={`/listing/${listing.id}/${slugify(listing.title)}`}>
            {children}
          </Link>
        )}
      />
    </PageContainer>
  );
}
