import {
  IDemoRequestDto,
  IDemoResponseDto,
  fetchApi,
} from '@repo/skye-hosts-api-client';
import { GlampingInfoCard } from '@repo/web-components/listings/glamping-info-card';
import { DemoFormWrapper } from './DemoFormWrapper';

export const dynamic = 'force-dynamic';

export default async function DemoPage() {
  const demo = await fetchApi<IDemoResponseDto, IDemoRequestDto>('/demo', {
    name: 'World',
  });

  return (
    <div>
      <h1>Demo</h1>
      <GlampingInfoCard
        name="Woodland Retreat"
        description="A secluded bell tent nestled among ancient oaks, with a private fire pit and stargazing deck."
        rating={4.9}
        tags={['Bell Tent', 'Fire Pit', 'Pet Friendly', 'Off-grid']}
      />
      <pre>{JSON.stringify(demo, null, 2)}</pre>
      <DemoFormWrapper />
    </div>
  );
}
