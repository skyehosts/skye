# Listing Amenities Display (Guest Website)

## Overview

The guest website listing detail page displays a "What this place offers" amenities section between the description and location sections. It shows a preview of 5 amenities with a modal for the full categorised list.

## Data Flow

1. **Server component** (`page.tsx`) fetches two endpoints in parallel via `Promise.all`:
   - `GET /listing/:id` — returns `amenities: ListingAmenityId[]` (flat array of IDs)
   - `GET /listing/amenities` — returns full catalogue: 18 categories, each with `{ id, title, icon }` amenity objects
2. Both are passed as props to `ListingAmenitiesSection` (client component)
3. The component cross-references listing IDs against the catalogue using a `Set` for O(1) lookup, producing:
   - A flat ordered list (category priority order — essentials first) for the preview
   - Filtered categories (only those with matching amenities) for the modal

## Icon Rendering

Amenity icons are stored as MDI (Material Design Icons) kebab-case strings in the API (e.g. `'wifi'`, `'towel-rail'`). The host app renders these via `react-native-paper`, but the guest website uses MUI.

**Solution:** `@mdi/js` + `@mdi/react` — pure web packages from the same icon maintainers (Pictogrammers). A static mapping file (`mdi-amenity-icon-map.ts`) imports only the ~96 icons used by amenities for tree-shaking (~20-30KB gzipped).

5 icons don't exist in `@mdi/js` and use visual substitutes:

- `pillow` → `mdiBedEmpty`, `towel-rail` → `mdiRadiator`, `sink` → `mdiFaucet`, `mountain` → `mdiTerrain`, `book-child` → `mdiBookEducation`

Unknown icon names fall back to `mdiHelpCircleOutline`.

**When adding a new amenity:** add its `@mdi/js` import and kebab-case mapping entry to `mdi-amenity-icon-map.ts`.

## Key Files

| File                                                                 | Purpose                             |
| -------------------------------------------------------------------- | ----------------------------------- |
| `packages/web-components/src/listings/mdi-amenity-icon-map.ts`       | Static icon name → SVG path mapping |
| `packages/web-components/src/listings/amenity-icon.tsx`              | Reusable `AmenityIcon` component    |
| `packages/web-components/src/listings/listing-amenities-section.tsx` | Preview section (5 items + button)  |
| `packages/web-components/src/listings/listing-amenities-modal.tsx`   | Full modal grouped by category      |

## Non-obvious Decisions

- **First 5 by category order, not random** — random would change on every SSR render, breaking cacheability and SEO consistency.
- **Fetches catalogue from API** rather than importing `LISTING_AMENITY_CATEGORIES` constant directly — keeps the frontend decoupled from the constant definition and consistent with the pattern of fetching data from the API.
- **Static icon map** rather than importing all ~7,000 MDI icons — the full `@mdi/js` package is ~1.6MB; the static map includes only what we use.
