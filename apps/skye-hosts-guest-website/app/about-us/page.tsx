import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';

export default function AboutUsPage() {
  return (
    <PageContainer disableTopPadding>
      <HeadingPanel title="About us" />
      <PrincipalColumn>
        <p>foo</p>
      </PrincipalColumn>
    </PageContainer>
  );
}
