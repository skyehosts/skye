import { Typography } from '@mui/material';
import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';

export default function CancellationPoliciesPage() {
  return (
    <PageContainer disableTopPadding>
      <HeadingPanel title="Cancellation policies" />
      <PrincipalColumn>
        <Typography variant="body1" component="div">
          <p>TODO: Full cancellation policy content.</p>
        </Typography>
      </PrincipalColumn>
    </PageContainer>
  );
}
