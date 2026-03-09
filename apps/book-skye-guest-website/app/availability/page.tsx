import { IAvailabilityResponseDto, fetchApi } from '@repo/skye-hosts-api-client';

export const dynamic = 'force-dynamic';

export const revalidate = 600;

export default async function AvailabilityPage() {
  const availability =
    await fetchApi<IAvailabilityResponseDto>('/availability');

  throw 'def';

  return (
    <div>
      <h1>Availability</h1>
      <pre>{JSON.stringify(availability, null, 2)}</pre>
    </div>
  );
}
