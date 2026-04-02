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

## MD3 theme overrides (React Native Paper)

`app/theme/index.ts` overrides several MD3LightTheme colours to prevent purple defaults from bleeding through react-native-paper components (IconButton, RadioButton, Checkbox, Chip):

| MD3 token              | Override value        | Why                                                        |
| ---------------------- | --------------------- | ---------------------------------------------------------- |
| `primary`              | `colors.primary`      | All primary-coloured components use deepSkyeBlue           |
| `secondary`            | `colors.secondary`    | Secondary token alignment                                  |
| `secondaryContainer`   | `colors.primaryLight` | `contained-tonal` buttons + bottom tab active indicator bg |
| `onSecondaryContainer` | `colors.primary`      | Icon/text colour inside secondaryContainer                 |
| `outline`              | `colors.border`       | `outlined` mode border default                             |

## Icon colour convention

See `CLAUDE.md` → "Icon & colour conventions" for the full decision table. Summary:

| Category                      | Colour                      | Token                   |
| ----------------------------- | --------------------------- | ----------------------- |
| Decorative / non-interactive  | `seaGlassTeal` (#4F8C8D)    | `colors.iconDecorative` |
| Clickable / interactive icons | `deepSkyeBlue` (#1F3F4A)    | `colors.icon`           |
| Selected state (cards)        | `deepSkyeBlue` (#1F3F4A)    | `colors.primary`        |
| Active bottom tab             | `deepSkyeBlue` (#1F3F4A)    | `colors.primary`        |
| Inactive bottom tab           | `grey600` (#666666)         | `colors.iconInactive`   |
| Modal close buttons           | `grey600` (#666666)         | `colors.iconMuted`      |
| Info icons                    | `heatherPurple` (#8B6FAF)   | `colors.heatherPurple`  |
| Warning icons                 | `autumnBracken` (#FF9500)   | `colors.warning`        |
| Error icons                   | `rowanBerryLight` (#D4837A) | `colors.danger`         |
| Icons on dark bg              | `warmStone` (#C8BFAE)       | `colors.iconOnDark`     |

**Key distinction**: `colors.icon` (deepSkyeBlue) is for interactive/clickable icons. `colors.iconDecorative` (seaGlassTeal) is for non-interactive decorative icons (amenity lists, step card icons, empty state illustrations). Never use `textSecondary` or `textPrimary` for icon colours.

In web apps, `iconDefault` and `iconOnDark` are available via MUI's `custom` palette (e.g. `sx={{ color: 'custom.iconDefault' }}`).

## Consumption

- **skye-hosts-app**: re-exports via `app/theme/*.ts` → consumed through `app/theme/index.ts`
- **skye-hosts-guest-website**: `app/theme/palette.ts` re-exports selected colours from `@repo/theme`
- **storybook**: imports palette directly for the Highland Palette showcase
- **Future apps**: add `"@repo/theme": "workspace:*"` and import directly
