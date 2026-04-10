# Guest Website Layout System

## Content width strategy

All wide page content, header inner content, and footer inner content share a single max-width (`CONTENT_MAX_WIDTH = 1800px`) and horizontal padding (`contentPaddingX = { xs: 2, sm: 3 }`), defined in `packages/web-components/src/layout/layout-constants.ts`. This ensures edges align across header, page body, and footer.

## Key components

### PageContainer (`packages/web-components/src/layout/page-container.tsx`)

- Default `maxWidth: 1120px` — suitable for narrower pages (forms, legal, detail pages).
- Pages that need the wider layout pass `maxWidth={CONTENT_MAX_WIDTH}` (imported from `layout-constants`).
- Padding uses `contentPaddingX` from layout-constants.

### Header (`packages/web-components/src/navigation/header.tsx`)

- AppBar spans full viewport width (background color fills edge-to-edge).
- Toolbar inner content is constrained to `CONTENT_MAX_WIDTH` with `mx: 'auto'` and matching `contentPaddingX`.

### Footer (`packages/web-components/src/navigation/footer.tsx`)

- Outer `<footer>` spans full width (background color fills edge-to-edge).
- Inner content Box is constrained to `CONTENT_MAX_WIDTH` with `mx: 'auto'`.

### HeadingPanel (`packages/web-components/src/layout/heading-panel.tsx`)

- Full-bleed: uses `width: 100vw` + `left: 50%; transform: translateX(-50%)` to break out of any parent max-width constraint.
- Border-bottom spans the full viewport width.

## Non-obvious decisions

- The root layout (`app/layout.tsx`) uses `<Container maxWidth={false} disableGutters>` so header/footer can render full-bleed. Each page is responsible for its own width constraint via `PageContainer`.
- `CONTENT_MAX_WIDTH` is intentionally a constant (not a theme token) because it's a layout architecture choice, not a design token.
