import Container from '@mui/material/Container';
import type { ReactNode } from 'react';

import { contentPaddingX } from './layout-constants';

interface PageContainerProps {
  children: ReactNode;
  /** Max content width in px. Defaults to 1120 to match the listing detail page. */
  maxWidth?: number;
  /** Omit vertical top padding — useful for pages whose first element is a hero/banner. */
  disableTopPadding?: boolean;
}

/**
 * Standard page-level wrapper for the guest website.
 *
 * The root `app/layout.tsx` uses `<Container disableGutters>` so the header and
 * footer can render full-bleed. That means each page is responsible for its own
 * horizontal gutters — this component is the canonical way to do it. Every
 * top-level `page.tsx` should wrap its content in `<PageContainer>`, with the
 * exception of pages that need a full-bleed hero (e.g. listing detail), which
 * manage padding bespoke.
 */
export function PageContainer({
  children,
  maxWidth = 1120,
  disableTopPadding,
}: PageContainerProps) {
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth,
        px: contentPaddingX,
        pt: disableTopPadding ? 0 : { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 6 },
      }}
    >
      {children}
    </Container>
  );
}
