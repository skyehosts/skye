import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';

export default function AboutUsPage() {
  return (
    <>
      <HeadingPanel title="About us" />
      <PrincipalColumn>
        <p>foo</p>
      </PrincipalColumn>
    </>
  );
}
