import { Typography } from '@mui/material';
import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';
import { TextSection } from '@repo/web-components/layout/text-section';

export default function TermsAndConditionsPage() {
  return (
    <PageContainer disableTopPadding>
      <HeadingPanel title="Terms of service" />
      <PrincipalColumn>
        <Typography variant="body1" component="div">
          <TextSection title="1. Lorem ipsum dolor sit amet">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              fermentum neque vel pretium placerat. Sed eleifend, magna nec
              accumsan convallis, diam enim sollicitudin mi, eget tempor mauris
              purus quis augue.
            </p>
          </TextSection>
          <TextSection title="2. Lorem ipsum dolor sit amet">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              fermentum neque vel pretium placerat. Sed eleifend, magna nec
              accumsan convallis, diam enim sollicitudin mi, eget tempor mauris
              purus quis augue.
            </p>
          </TextSection>
        </Typography>
      </PrincipalColumn>
    </PageContainer>
  );
}
