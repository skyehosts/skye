import { PageContainer } from '@repo/web-components/layout/page-container';
import {
  IAvailabilityResponseDto,
  fetchApi,
} from '../../../../packages/skye-hosts-api-client/src';

export const dynamic = 'force-dynamic';

export const revalidate = 600;

export default async function AvailabilityPage() {
  const availability =
    await fetchApi<IAvailabilityResponseDto>('/availability');

  throw 'def';

  return (
    <PageContainer>
      <h1>Availability</h1>
      <pre>{JSON.stringify(availability, null, 2)}</pre>
    </PageContainer>
  );
}
