import { Typography } from '@mui/material';
import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';
import { TextSection } from '@repo/web-components/layout/text-section';

export default function TermsAndConditionsPage() {
  return (
    <>
      <HeadingPanel title="Terms of service" />
      <PrincipalColumn>
        <Typography variant="body1" component="div">
          <p>
            <i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i>
          </p>
          <p>Sed eleifend, magna nec accumsan convallis:</p>
          <ul>
            <li>Lorem ipsum dolor</li>
            <li>Consectetur adipiscing elit</li>
            <li>Praesent fermentum neque</li>
          </ul>
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
    </>
  );
}
