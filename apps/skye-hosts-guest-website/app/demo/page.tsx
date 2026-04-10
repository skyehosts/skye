import { PageContainer } from '@repo/web-components/layout/page-container';
import { GlampingInfoCard } from '@repo/web-components/listings/glamping-info-card';
import {
  IDemoRequestDto,
  IDemoResponseDto,
  fetchApi,
} from '../../../../packages/skye-hosts-api-client/src';
import { DemoFormWrapper } from './DemoFormWrapper';

export const dynamic = 'force-dynamic';

export default async function DemoPage() {
  const demo = await fetchApi<IDemoResponseDto, IDemoRequestDto>('/demo', {
    name: 'World',
  });

  return (
    <PageContainer>
      <h1>Demo</h1>
      <GlampingInfoCard
        name="Woodland Retreat"
        description="A secluded bell tent nestled among ancient oaks, with a private fire pit and stargazing deck."
        rating={4.9}
        tags={['Bell Tent', 'Fire Pit', 'Pet Friendly', 'Off-grid']}
      />
      <pre>{JSON.stringify(demo, null, 2)}</pre>
      <DemoFormWrapper />
    </PageContainer>
  );
}
