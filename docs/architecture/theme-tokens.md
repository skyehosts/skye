# Theme Tokens (`@repo/theme`)

## Purpose

Single source of truth for all design tokens consumed by frontend apps (React Native and Next.js). Houses the colour palette, spacing, border-radius, and font-weight — everything visual that is shared across apps.

## Key decisions

- **Palette lives here, not in `@repo/common`** — `@repo/common` is strictly non-UI (app names, environments, date utils). All hex colour values belong in `@repo/theme/palette.ts`.
- **React Native app re-exports** — `apps/skye-hosts-app/app/theme/spacing.ts` (and border-radius, font-weight) re-export from `@repo/theme` so existing imports (`from "../theme"`) continue to work unchanged.
- **Typography and line-height stay in the RN app** — these are platform-specific (MUI has its own responsive typography system).

## Token inventory

| Token          | File                   | Values                                                           |
| -------------- | ---------------------- | ---------------------------------------------------------------- |
| palette        | `src/palette.ts`       | All hex colours: brand, accent, functional, neutral, third-party |
| `spacing`      | `src/spacing.ts`       | xs=4, sm=8, md=16, lg=24, xl=32                                  |
| `borderRadius` | `src/border-radius.ts` | xs=4, sm=8, md=12, lg=16, xl=20                                  |
| `fontWeight`   | `src/font-weight.ts`   | normal=400, medium=500, semibold=600, bold=700                   |

## Consumption

- **skye-hosts-app**: re-exports via `app/theme/*.ts` → consumed through `app/theme/index.ts`
- **skye-hosts-guest-website**: `app/theme/palette.ts` re-exports selected colours from `@repo/theme`
- **storybook**: imports palette directly for the Highland Palette showcase
- **Future apps**: add `"@repo/theme": "workspace:*"` and import directly
