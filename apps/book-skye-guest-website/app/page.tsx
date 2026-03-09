import {
  fetchApi,
  IGetAllListingsResponseDto,
  slugify,
} from '@repo/book-skye-api-client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await fetchApi<IGetAllListingsResponseDto>('/listing/all');

  return (
    <main>
      <h1>Listings</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          padding: '16px',
        }}
      >
        {data.listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}/${slugify(listing.title)}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#e0e0e0',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '14px',
                }}
              >
                No image
              </div>
              <div style={{ padding: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '16px' }}>{listing.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
