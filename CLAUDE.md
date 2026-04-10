# Monorepo Patterns

## General guide

- **This project is pre-production.** There is no live data or live users. Destructive DB changes (non-nullable columns, dropping data, deleting rows) are fine — no need to treat them as risky.
- Always run pnpm lint and pnpm build after making changes and fix issues if present.
- Then run pnpm format
- After you do things, if there are steps I need to take like adding env vars etc, create a new file in /docs/user-todos/x.md
- After completing work on any feature, update `docs/architecture/`. If no file exists for the feature, create one. If one exists, keep it current. Focus on: critical journeys, unintuitive or concealed logic, non-obvious design decisions, and high-level flow. Not exhaustive references. Also update `docs/architecture/table-of-contents.md` if a new file was created.

## Guide for: Error handling and observability

We are strongly adverse to silent failures. Any unexpected error must be reported — both logged and sent to Sentry — so failures are always visible.

### In `apps/skye-hosts-api` (NestJS)

The `ErrorFormatFilter` only captures unhandled exceptions that escape the HTTP pipeline. Errors caught inside services (background jobs, cron tasks, swallowed catches) must be reported manually.

**Rule: every `this.logger.error` call must be paired with `Sentry.captureException`.**

```ts
import * as Sentry from '@sentry/nestjs';

} catch (error) {
  this.logger.error('Failed to do X', error);
  Sentry.captureException(error);
}
```

Exceptions where Sentry is NOT needed alongside `logger.error`:

- Errors that are immediately re-thrown (the caller or error filter will capture them)
- Expected/handled HTTP errors (e.g. validation errors logged in response interceptor)

**`logger.debug` vs `logger.error`:** Use `logger.debug` for operational flow (requests, queries, job status). Use `logger.error` only for unexpected failures. Never use `logger.debug` for caught errors.

### In `apps/skye-hosts-app` (React Native)

Use `captureException` from `app/services/error-reporting` for all unexpected errors. It logs to console via `log.error` and sends to Sentry in one call.

```ts
import { captureException } from '../services/error-reporting';

} catch (e) {
  captureException(e);
  // then handle UI state...
}
```

The central helpers already call `captureException` internally — you only need to add it manually when bypassing them:

- `handleApiError(e, setServerError)` — captures 5xx and non-`ApiRequestError` automatically
- `handleFormError(e, setError, setServerError)` — captures all non-validation errors automatically

When to NOT call `captureException`:

- Expected states that are not bugs (e.g. permission denied, image polling not-ready yet)
- Errors that are immediately re-thrown (the outer catch will capture them)

## Guide for: skye-hosts-app (React Native / Expo)

- Uses EAS for all native builds — never use `expo run:android` or `expo run:ios`
- Dev workflow: `expo start --dev-client` for JS changes (no rebuild needed)

## Guide for: API → Client → Frontend: Adding a new endpoint

This documents the end-to-end pattern for adding a typed API endpoint into apps/skye-hosts-api, use `apps/skye-hosts-api/src/modules/demo` and `apps/skye-hosts-guest-website/app/demo` as the canonical reference implementation. This applies to all apps that call endpoints on skye-hosts-api.

---

### 1. Define shared types in `packages/skye-hosts-api-client`

Add interfaces under `src/dto-interfaces/<module>/`:

```
packages/skye-hosts-api-client/src/dto-interfaces/demo/
  demo-request.dto.ts   → export interface IDemoRequestDto { ... }
  demo-response.dto.ts  → export interface IDemoResponseDto { ... }
```

Export from `packages/skye-hosts-api-client/src/index.ts`:

```ts
export * from "./dto-interfaces/demo/demo-request.dto";
export * from "./dto-interfaces/demo/demo-response.dto";
```

Interface naming: prefix with `I`, suffix with `Dto` (e.g. `IDemoRequestDto`).

---

### 2. Implement DTOs in `apps/skye-hosts-api`

NB: Use logger.debug instead of logger.log

Under `apps/skye-hosts-api/src/modules/<module>/dto/`:

```ts
// demo-request.dto.ts
import { IDemoRequestDto } from "@repo/skye-hosts-api-client";
export class DemoRequestDto implements IDemoRequestDto {
  @IsString()
  name: string;
}

// demo-response.dto.ts
import { IDemoResponseDto } from "@repo/skye-hosts-api-client";
export class DemoResponseDto implements IDemoResponseDto {
  message: string;
  receivedAt: Date;
}
```

Classes implement the shared interface — TypeScript enforces shape parity between API and client.
Export both from `dto/index.ts`.

---

### 3. Implement the controller in `apps/skye-hosts-api`

```ts
@Controller("demo")
export class DemoController {
  @Post()
  @IgnoreBearerAuthentication() // omit for protected routes
  async onRoot(@Body() body: DemoRequestDto): Promise<DemoResponseDto> {
    return { message: `Hello, ${body.name}!`, receivedAt: new Date() };
  }
}
```

Ensure controller method uses the AuthoriseRole decorator
Use `@Body()` for request DTOs. Use `@Get()` / `@Query()` only for parameter-less or filter-only reads.
Register the module in `app.module.ts`.

---

### 4. Consume in `apps/skye-hosts-guest-website`

```ts
// app/demo/page.tsx
import { IDemoRequestDto, IDemoResponseDto } from '@repo/skye-hosts-api-client';
import { fetchApi } from '../services/api.service';

// NB: No exporting of 'revalidate' by default, unless you think page warrants it, then ask
// Do not export revalidate by default unless otherwise instructed (I.E no ISR)
export default async function DemoPage() {
  const demo = await fetchApi<IDemoResponseDto, IDemoRequestDto>('/demo', { name: 'World' });
  return <pre>{JSON.stringify(demo, null, 2)}</pre>;
}
```

`fetchApi<TResponse, TBody>` (in `app/services/api.service.ts`):

- Unwraps `IApiResponse<T>` envelope and returns `payload` directly.
- Whenever receiveing data from api, be aware that .payload needs unwrapped.

### 5. Create TypeOrm migration

- If there are any typeorm entities that were create, don't forgot to create migraton by using command:
  pnpm --filter=skye-hosts-api migration:generate src/migrations/name
- Then run it pnpm --filter=skye-hosts-api migration:run

---

### Key rules

- **Interfaces live in `@repo/skye-hosts-api-client`** — never define shared types inside `apps/`.
- **API DTOs implement the interface** — `class FooResponseDto implements IFooResponseDto`.
- **Frontend imports the interface** — pass it as the generic to `fetchApi<T>`.
- **When adding a workspace dependency**: always use `workspace:*` suffix:
  `pnpm --filter='<pkg>' add '@repo/skye-hosts-api-client@workspace:*'`

## Guide for: Relationships between applications

- apps/aws-infrastructure
  - Infrastructure for skye-hosts-api
  - Includes:
    - SQS queue for bookings
- apps/skye-hosts-api
  - Services these applications: skye-hosts-admin-website, skye-hosts-guest-website, skye-hosts-app, skye-glamping-website
- apps/skye-hosts-guest-website
  - The glamping listings are stored in skye-hosts-api same as their listings. Only difference is a type differentiator on the model.
  - Does not have it's own database/api, uses skye-hosts's api for handling bookings, payments & listing data etc.
  - Pretty much all feautres in skye-hosts-guest-website will also exist in skye-glamping-website. Keeping duplication of code to an absolute minimum is critical. Store logic/components either in ui package.
  - React native app for hosts to create & manage their listings

## Guide for: Shared packages — theme vs common

- **`@repo/theme`** — all design tokens: palette (hex colors), `spacing`, `borderRadius`, `fontWeight`. This is the single source of truth for visual constants.
- **`@repo/common`** — strictly non-UI shared code: app names, environments, date utils. No colors or styling.
- **All hex color values must live in `packages/theme/src/palette.ts`** — app-level color files (e.g. `colors.ts`) must only reference palette imports, never inline hex values.

## Guide for: E2E tests (frontend apps)

- Frontend e2e tests (Playwright) run against a real API server connected to a separate `skye-hosts-test` postgres database.
- When `pnpm test:e2e` runs, Playwright automatically starts the API via `pnpm --filter skye-hosts-api dev:e2e`, then calls `POST /seed/e2e-reset` to truncate all tables and seed test data before tests begin.
- **When writing e2e tests that need specific data**, add that data to the e2e seeder at `apps/skye-hosts-api/src/modules/seed/providers/e2e-seed.service.ts`. This is separate from the existing `SeedService` which is for non-e2e seeding.
- Seeded test accounts: `host@test.com` (host) and `guest@test.com` (guest), both with password `Password123!`.
- E2e global setup lives in each app's `e2e/global-setup.ts`.
- The API e2e env config is at `apps/skye-hosts-api/.env.e2e` (gitignored).

## Guide for: NestJS module entity ownership

- **Each entity belongs to exactly one module** — only that module should register it in `TypeOrmModule.forFeature([...])`.
- **Never re-register a foreign entity** in your module's `forFeature`. If you need a repository for an entity owned by another module, import that module instead (provided it exports `TypeOrmModule`).
- **Modules that own entities and need to share their repositories** should include `TypeOrmModule` in their `exports` array (see `AccountModule` and `MessageModule` as examples).
- **Circular dependency exception**: if importing the owning module would create a circular dependency, registering the entity locally in `forFeature` is acceptable as a pragmatic workaround — document it with a comment explaining why.

## Guide for: Adding components

- Any bespoke, non-trivial components created should be added to packages/ui and and then referenced in storybook
- When a component in packages/ui is updated, it's reference should also be updated in storybook (where appropriate)

## Guide for: Icon & colour conventions

Canonical reference: `apps/skye-hosts-app/app/style-guide.tsx` — live examples of every color pattern (buttons, icons, cards, chips, links, info boxes, steppers). Accessible from the Menu page in dev builds.

Every icon colour has a specific use-case. Do not mix them.

| Use-case                      | Token (`colors.___`) | Palette value                 | When to use                                                                                                                 |
| ----------------------------- | -------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Clickable / interactive icons | `icon`               | `deepSkyeBlue` (#1F3F4A)      | Chevrons in pressable rows, menu icons, add-photo, clickable tooltip triggers, any icon inside a Pressable/TouchableOpacity |
| Purely decorative icons       | `iconDecorative`     | `seaGlassTeal` (#4F8C8D)      | Non-interactive decorative icons (rare — most icons are interactive; use `icon` by default)                                 |
| Selected / active state       | `primary`            | `deepSkyeBlue` (#1F3F4A)      | Selected selection-card icon, contained button icons                                                                        |
| Selected card background      | `primaryLight`       | `deepSkyeBlueLight` (#E0EDF0) | Background fill for selected cards in create/edit listing journey                                                           |
| Active bottom tab             | `primary`            | `deepSkyeBlue` (#1F3F4A)      | Bottom navigation bar active icon                                                                                           |
| Inactive bottom tab           | `iconInactive`       | `grey600` (#666666)           | Bottom navigation bar inactive icon                                                                                         |
| Modal close / dismiss         | `iconMuted`          | `grey600` (#666666)           | Close (×) buttons on modals/sheets — intentionally muted                                                                    |
| Info icons                    | `heatherPurple`      | `heatherPurple` (#8B6FAF)     | Info-box info variant, help-circle-outline tooltips                                                                         |
| Warning icons                 | `warning`            | `autumnBracken` (#FF9500)     | Info-box warning variant, alert-outline                                                                                     |
| Error / danger icons          | `danger`             | `rowanBerryLight` (#D4837A)   | Info-box error variant, delete/remove actions                                                                               |
| Icons on dark backgrounds     | `iconOnDark`         | `warmStone` (#C8BFAE)         | Any icon rendered on a dark background                                                                                      |

**Rules:**

- Never use `textSecondary` for icon colours — use `icon` (deepSkyeBlue) for interactive icons, `iconMuted` for dismiss.
- Never use `textPrimary` for selected icon states — use `primary` (deepSkyeBlue).
- Button-embedded icons (via react-native-paper `<Button icon={...}>`) inherit colour from the button variant — do not override.
- Info-box backgrounds must pair with their icon colour: `heatherPurpleLight` for info, `autumnBrackenLight` for warning, `rowanBerryPale` for error.
- Info boxes should use their default variant icon unless a custom icon meaningfully improves guidance (e.g. `gesture-swipe` to hint at a swipe interaction). Don't override the icon just for decoration.

## Guide for: Styling in skye-hosts-app

- **Never hardcode colors, spacing, or font sizes** — always import tokens from `app/theme/`.
  - `colors` for all color values (e.g. `colors.textSecondary`, not `"#666"`)
  - `spacing` for margins, paddings, gaps (e.g. `spacing.lg`, not `24`)
  - `typography` for font sizes (e.g. `typography.md`, not `16`)
- **Wrap every screen in `<ScreenContainer>`** (from `app/components/screen-container.tsx`). Pass additional layout styles via the `style` prop.
- **Keep `StyleSheet.create()` colocated** at the bottom of each screen file — no separate `styles.ts` files.
- If a new color, spacing value, or font size is needed, add it to the relevant token file rather than inlining it.
- **All hex color values must live in `packages/theme/src/palette.ts`** — `colors.ts` must only reference palette imports, never inline hex values. The only exception is `rgba(...)` for transparency.
- **Check `commonStyles` before writing any new local style.** `app/theme/common-styles.ts` is the single source of truth for shared patterns. Before adding a style to a local `StyleSheet.create()`, check if an equivalent already exists in `commonStyles` and use that instead.
- **Promote repeated styles to `commonStyles`.** If the same style object appears in more than one file, move it to `common-styles.ts` and replace all local copies. Key shared patterns already there include: `card`, `modal`, `modalTitle`, `row`, `divider`, `borderedRows`, `itemTitle`, `itemSubtext`, `editSection`, `editSectionCards`, `sectionLoader` — use these rather than redefining them locally.

## Guide for: Tooltips in skye-hosts-app

- **Do NOT use react-native-paper's `<Tooltip>`** — it does not reliably clamp to viewport bounds and can overflow off-screen.
- Use the viewport-safe tooltip pattern: a `<Portal>` with a backdrop `<Pressable>` to dismiss, and a positioned `<View>` using `clampTooltipLeft()` from `app/utils/tooltip.ts` for horizontal positioning.
- Shared tooltip styles (container, text, backdrop) live in `app/calendar/components/tooltip-styles.ts`.
- `clampTooltipLeft(x)` guarantees the tooltip stays within the viewport with an 8px margin on both sides.
- To measure trigger position, use `ref.current.measureInWindow((x, y, w, h) => ...)`.
- See `app/components/calendar-sync-summary-card.tsx` for a canonical example of an info-icon tooltip, and `app/calendar/components/blocked-date-tooltip.tsx` for a full calendar tooltip.

## Guide for: Styling in web apps (Next.js / MUI)

- **Never hardcode hex colors** — use MUI theme tokens in components and palette imports in theme config.
  - Colors from `packages/theme/src/palette.ts` are mapped to `theme.palette.custom.*` (e.g. `bgcolor: 'custom.driftwoodSand'`, not `'#E7E1D6'`).
  - Use MUI semantic tokens for standard text colors (`text.primary`, `text.secondary`, `text.disabled`).
  - **All hex color values must live in `packages/theme/src/palette.ts`** — theme providers and palette re-exports must only reference palette imports, never inline hex values.
- **Use MUI's `shape.borderRadius` multiplier** — write `borderRadius: 1` (= 4px) instead of `'4px'`. The theme sets `shape.borderRadius: 4` in `packages/web/src/theme/create-app-theme.ts`.
- **Use MUI `sx` prop spacing shorthands** — `mt: 2`, `px: 3`, etc. rather than raw pixel values.

## Guide for frontend implementations

### 1. Forms

- Should send HTTP requests to apps/skye-hosts-api (Not Nextjs API routes)
- Always use `applyServerErrors` from `@repo/ui/forms/apply-server-errors` in the catch block to map API validation errors onto fields. See canonical examples:
  - Web: `packages/ui/src/auth/sign-up-form.tsx`
  - Native (host app): `apps/skye-hosts-app/app/demo-form.tsx` — full demo form posting to `POST /demo/form`

#### React Native form pattern (skye-hosts-app)

Canonical reference: `apps/skye-hosts-app/app/demo-form.tsx`. Every form with text inputs MUST follow this pattern:

1. **`useForm` + `Controller`** — wrap every text input in `<Controller control={control} name="fieldName" rules={{...}} render={...} />`. Never use `setValue`/`watch`/`register` for text fields — always use `Controller`.
2. **`rules` on Controller** — add frontend validation (required, pattern, minLength, etc.) directly on the `Controller` `rules` prop. Use `pattern` with regex for emails: `{ value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" }`.
3. **`HelperText type="error"`** — render field-level errors from `formState.errors` using react-native-paper's `<HelperText>` directly below each field.
4. **`handleFormError(e, setError, setServerError)`** — use in every form catch block. Maps API validation errors to fields via `applyServerErrors`, shows `SERVER_ERROR_MESSAGE` for 5xx, and `e.message` for <500.
5. **`AppSnackbar`** — display toast messages. **Defaults to `type="error"` (danger colors)** — always pass `type="success"` explicitly for non-error messages (e.g. confirmations, copy-to-clipboard). Example: `<AppSnackbar message={snackbar?.message ?? ""} onDismiss={() => setSnackbar(null)} type={snackbar?.type} />`.
6. **`isSubmitting` from `formState`** — use for loading/disabled state instead of manual `useState(loading)`.
7. **`handleSubmit(onSubmit)`** — wire to button's `onPress`.

For non-form API calls (toggles, selections, actions with no text fields), use `handleApiError(e, setServerError)` from `utils/form-error-handler.ts` instead — no `useForm` needed.

### 1. Search Intent Optimization

- Identify and align with primary search intent (informational, transactional, navigational, commercial).
- Ensure the content fully satisfies the dominant intent before adding secondary topics.
- Provide comprehensive, structured, and directly actionable information.
- Avoid keyword cannibalization, do not mix 'BnB' (skye-hosts-website) and 'Glamping' (skye-glamping-website)

### 2. Keyword Strategy

- Identify:
  - 1 Primary keyword (main target phrase)
  - 5–10 Secondary keywords (variations, long-tail, semantic)
- Naturally integrate keywords into:
  - Title (H1)
  - First 100 words
  - At least one H2
  - Meta description
  - URL slug (if applicable)
- Avoid keyword stuffing. Maintain natural language flow.
- Use semantic keyword variations and related entities for topical depth.

### 3. Content Structure & Formatting

- Use a single H1 per page.
- Use hierarchical headings (H2 → H3 → H4).
- Keep paragraphs short (2–4 lines).
- Use bullet points and numbered lists for scannability.
- Include a concise summary or key takeaway section when appropriate.
- Add FAQ sections using structured Q&A formatting when relevant.

### 4. Metadata Optimization

- Generate:
  - SEO-optimized Title Tag (50–60 characters)
  - Meta Description (140–160 characters, compelling, includes primary keyword)
- Ensure title includes emotional trigger or value proposition when possible.
- Avoid truncation risks.

### 5. Internal & External Linking

- Suggest relevant internal linking opportunities using descriptive anchor text.
- Include authoritative external references when helpful.
- Avoid generic anchor text like "click here."

### 6. Technical SEO Considerations

- Descriptive image alt text
- Schema markup opportunities (FAQ, Article, Product, etc.)
- Fast-loading media recommendations
- Ensure content is mobile-friendly and structured for Core Web Vitals.
- Prioritize LCP under 2.5s
- Use static generation where possible
