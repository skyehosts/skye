# Listing Detail: "Things to know" Section

Guest-facing section on the listing detail page showing house rules and safety information. Located beneath "What this place offers" (amenities) on both guest and glamping websites.

## Data flow

All data comes from `IGetListingResponseDto` — no additional API calls needed. The section reads:

- **House rules**: `checkInTimeStart`, `checkInTimeEnd`, `checkOutTime`, `maxGuests`, all `houseRule*` booleans, `houseRuleOtherRules` freetext
- **Checkout instructions**: `checkoutInstruction*` fields, filtered against `CHECKOUT_INSTRUCTION_OPTIONS` config
- **Safety devices/considerations**: `safetyDevices` and `safetyConsiderations` string arrays (tri-state format `"id:yes"`, `"id:no"`, `"id:na"` — only `yes` items are displayed)

## Responsive layout

- **Mobile (< md)**: Vertical list of tappable cards. Each card shows icon, title, 3-line preview, right chevron. Tap opens a full-screen modal.
- **Desktop (>= md)**: 3-column grid. Each column shows icon on top, title, 3-line preview, "Learn more" link. Click opens a dialog modal. Third column is a placeholder for future content.

## Icon mapping

The section reuses the `AmenityIcon` component and `mdiIconMap` from `mdi-amenity-icon-map.ts`. This map was extended to cover:

- **Safety device/consideration icons**: Already MDI-style names from `SAFETY_DEVICES_CONFIG` / `SAFETY_CONSIDERATIONS_CONFIG` (e.g. `cctv`, `molecule-co`, `slide`)
- **House rule icons**: Mapped from Ionicons names to MDI equivalents (e.g. `paw-outline` → `mdiPawOutline`, `moon-outline` → `mdiMoonWaningCrescent`)
- **Checkout instruction icons**: Mapped from Ionicons names to MDI equivalents (e.g. `trash-outline` → `mdiTrashCanOutline`)

This allows using `config.icon` directly as the lookup key from the shared configs in `@repo/skye-hosts-api-client`.

## File locations

| File                                                                      | Purpose                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `packages/web-components/src/listings/listing-things-to-know-section.tsx` | Main section with responsive layout + preview logic                                   |
| `packages/web-components/src/listings/listing-house-rules-modal.tsx`      | House rules modal (check-in/out, during stay, additional rules, before you leave)     |
| `packages/web-components/src/listings/listing-safety-modal.tsx`           | Safety modal (devices + considerations)                                               |
| `packages/web-components/src/listings/listing-things-to-know-styles.ts`   | Shared modal content styles                                                           |
| `packages/web-components/src/listings/mdi-amenity-icon-map.ts`            | Extended icon map (renamed export: `mdiIconMap`, backward-compat `mdiAmenityIconMap`) |

## Non-obvious decisions

- **Tri-state parsing**: Safety entries use `"id:value"` string format. We parse with `indexOf(':')` rather than `split(':')` to handle potential colons in IDs and satisfy TypeScript strictness.
- **Ionicons→MDI mapping**: House rules/checkout configs define Ionicons names (for the host RN app). The icon map includes these Ionicons names as keys pointing to visually equivalent MDI icons for web rendering.
- **3rd column placeholder**: Desktop layout renders an empty 3rd grid column — intended for future content (e.g. cancellation policy).
