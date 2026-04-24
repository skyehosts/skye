# Listing pricing

Pricing for Air-BnB-style listings. Hosts set **net income per night** (what lands in their bank); the system layers ~6% platform fees on top so the guest-facing price lands roughly 12% below Airbnb for the same host take.

## Storage

Most monetary values are integer pence. **Cleaning fee is the exception** — stored as whole pounds (`cleaningFeePound`). Hosts don't need pence granularity on a cleaning fee, so we avoid the off-by-100 class of mistake by keeping the unit visible in the field name. The pence-vs-pound unit is always encoded in the field suffix across both the DB column and all DTOs.

| Entity (`apps/skye-hosts-api/src/modules/listing/entities/`) | Shape                                                                                                                                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listing_season_pricing`                                     | one row per (listing, season). Seasons are fixed: `low` (Nov–Feb), `shoulder` (Mar–Apr + Sep–Oct), `peak` (May–Aug). Weekday vs weekend base rates; weekend = Fri + Sat nights platform-wide. |
| `listing_pricing`                                            | singleton per listing. `cleaningFeePound` (whole pounds; `0` means "not set"), extra-guest threshold + fee pence, three discount flags + percents.                                            |
| `listing_price_override`                                     | one row per (listing, date). Replaces the nightly rate for that date; cleaning, extra-guest, and discounts still apply.                                                                       |

Booking carries a frozen `priceBreakdown: IPriceBreakdownDto` JSONB column — historical pricing never mutates when seasons or discounts are later edited. `booking.totalPrice` (pounds) stays consistent with `priceBreakdown.totalGuestPence / 100`.

## Shared math — `packages/common/src/pricing/`

Pure, no IO, consumed by API, host app, and guest website. DTO-shaped types (`IPriceBreakdownDto`, `IQuoteRequestDto`, etc.) live in `types.ts` here alongside the math — **not** in `@repo/skye-hosts-api-client`. They're domain shapes the math anchors to, and keeping them next to the math avoids a dependency cycle (`api-client → common` for `Environments` already exists). Import pricing types from `@repo/common` directly.

- `constants.ts` — single source of truth for all fee rates and discount thresholds. `HOST_FEE_RATE` (0.03), `GUEST_FEE_SHORT_STAY_RATE` (0.03, stays ≤ 2 nights), `GUEST_FEE_LONG_STAY_RATE` (0, stays ≥ 3 nights), `STRIPE_PASS_THROUGH_RATE` (0.03), `LAST_MINUTE_DISCOUNT_MAX_DAYS` (14), `WEEKLY_DISCOUNT_MIN_NIGHTS` (7), `MONTHLY_DISCOUNT_MIN_NIGHTS` (28), `WEEKEND_NIGHT_WEEKDAYS = [5, 6]`.
- `seasons.ts` — `getSeasonForDate`, `isWeekendNight`.
- `discounts.ts` — `resolveApplicableDiscounts(ctx)`. **Stacking rule:** last-minute stacks with best-of(weekly, monthly); weekly and monthly are mutually exclusive.
- `calculate-quote.ts` — single entry point. Order of application is deliberate: per-night rate (override OR season weekday/weekend) → sum → extra-guest fee → cleaning fee (`cleaningFeePound * 100` to fold into pence subtotal) → discounts (multiplicative) → guest fee tier (by nights) → Stripe pass-through → host fee → host payout. Per-step `Math.round`; ±1p drift tolerated end-to-end.
- `format-gbp.ts` — pence-based. **All frontend price rendering must consume pence and use this formatter.** The earlier pounds-based local helper in `packages/web-components/src/booking/use-quote.ts` was deleted.

## API surface — listing module

Two controllers under `apps/skye-hosts-api/src/modules/listing/controllers/`:

- `listing-pricing.controller.ts` (host-only, ownership-asserted via `ListingAccessService`):
  - `GET /listing/:id/pricing` — full config (3 seasons + globals + `isComplete`).
  - `PUT /listing/:id/pricing/seasons/:season` — upsert one season.
  - `PUT /listing/:id/pricing/discounts` — upsert the three discount flags + percents.
  - `PUT /listing/:id/pricing/cleaning-fee` — set `cleaningFeePound` (0–500, `@IsInt()`).
  - `GET /listing/:id/overrides?from=&to=` — list overrides in range.
  - `PUT /listing/:id/overrides` — bulk upsert by `dates[]` + `pricePence`.
  - `DELETE /listing/:id/overrides` — bulk delete by `dates[]`.
  - `GET /listing/:id/calendar-prices?from=&to=` — per-date host-net for calendar display.
- `listing-quote.controller.ts`:
  - `POST /listing/:id/quote` — **public** (`@IgnoreBearerAuthentication()`). Input: `IQuoteRequestDto` (checkInDate, checkOutDate, guestCount). Returns `IPriceBreakdownDto`.

`ListingPricingService` exports `getBreakdownForBooking(listingId, checkIn, checkOut, guests, bookingCreatedAt)` for the booking pipeline, and `hasCompletePricing(listingId)` for the publishing guard.

## Booking integration

`BookingService.createBooking` calls `listingPricingService.getBreakdownForBooking(...)` before save and stores both `priceBreakdown` and the derived pounds `totalPrice` in the same transaction. **This is where historical pricing gets locked in.** Subsequent edits to season pricing, discounts, or overrides do not retroactively change any booking's stored totals.

## Publishing guard

`ListingService` status transitions to `active` call `listingPricingService.hasCompletePricing(listingId)`; incomplete pricing throws `BadRequestException`. Complete = all three seasons have weekday AND weekend prices > 0.

## Host app

- `apps/skye-hosts-app/app/edit-listing/pricing.tsx` — main screen. Three season cards + cleaning-fee card (tap → `PriceInputModal` → `PUT /pricing/cleaning-fee` → refetch) + extra-guest-fee card (still V1 read-only) + discounts section with live-saved toggles. Fetches on focus; discount edits debounce 250ms before PUT. Cleaning-fee card shows "Not set" when `cleaningFeePound === 0`. Warning InfoBox surfaces when `!pricing.isComplete`.
- `apps/skye-hosts-app/app/components/price-input-modal.tsx` — reusable integer-pound editor. Wraps a £-prefixed numeric `TextInput` in a react-hook-form `Controller` with min/max validation. Supports optional `helperText` rendered between input and `ActionBar`. First consumer is the cleaning-fee card; designed to cover the extra-guest fee card next.
- `apps/skye-hosts-app/app/edit-listing/pricing/season-wizard-modal.tsx` — full-screen two-stage modal. Stage 1 ("Set a weekday price"): compact centered `PriceInput` with expandable `GuestPriceBreakdown`. Stage 2 ("Set a weekend price"): large non-editable price display at top, `GuestPriceBreakdown` below, then a "Weekend premium" `PercentSlider` (0–100%, step 5, default 20%) as the only way to adjust — the displayed price derives from `weekdayPence * (1 + premium/100)`. Absolute-entry mode for the weekend price was removed; the wire format is still absolute pence, so on reopen the premium is reverse-computed and snapped to the nearest 5%.
- `apps/skye-hosts-app/app/components/percent-slider.tsx` — touch-responder-based horizontal slider (no native dep, no rebuild). Props: `value`, `onValueChange`, `min`, `max`, `step`, optional `ticks`. Used for the weekend premium.
- `apps/skye-hosts-app/app/edit-listing/pricing/guest-price-breakdown.tsx` — accordion header shows "Guest pays £X" (left) + "Show/Hide price breakdown" (right, next to chevron).
- `apps/skye-hosts-app/app/edit-listing/bookings-section.tsx` — pricing card shows "Peak £X · Shoulder £Y · Low £Z" once configured, and a warning chip when incomplete and not yet active.
- Calendar (`apps/skye-hosts-app/app/calendar/[id].tsx`): fetches calendar-prices + overrides alongside bookings/blocks. `DayCell` renders the host-net below the day number in `typography.xs`; override dates use the primary-coloured semibold variant.
- `apps/skye-hosts-app/app/calendar/components/price-override-modal.tsx` — opened from `DateBlockSheet`'s "Set price override" action when the selected range contains at least one unblocked, unbooked date. Expands the range (iCal-style exclusive end) and PUTs `{ dates, pricePence }`; Remove path DELETEs the subset of dates that already had overrides.

## Guest website

`packages/web-components/src/booking/use-quote.ts` — calls `POST /listing/:id/quote` via `useEffect`, returns `IQuoteResponseDto | null`. The `Quote` type alias is kept for call-site stability but now resolves to `IPriceBreakdownDto`. `packages/web-components/src/booking/booking-payment-section.tsx` reads pence fields directly (`totalGuestPence`, `nightlyRateSumPence`, `guestFeePence + stripeFeePence`) and renders via `formatGbp` from `@repo/common`. The cleaning-fee row is the exception — it's `cleaningFeePound`, shown only when `> 0`, and formatted as `formatGbp(quote.cleaningFeePound * 100)`. Applied discounts are listed as negative line-items. `GuestCounts.infants` maps to the backend's `babies` field (babies are excluded from the extra-guest count).

## Testing

- Unit: `packages/common/src/pricing/calculate-quote.spec.ts` — 20 cases covering season boundaries, discount stacking, extra-guest (babies excluded), override nights, guest-fee tier flip at 3 nights, rounding tolerance, zero-night rejection.
- E2E seed: `e2e-seed.service.ts` produces both a fully-priced listing and an un-priced listing for publishing-guard coverage.
- Seed service (`SeedService`) creates default pricing rows on every new listing so listings are immediately quote-able for internal dev.

## Open items

- `PaymentService` (`apps/skye-hosts-api/src/modules/payment/providers/payment.service.ts`) still has a stub `amount: 100, currency: 'usd'`. It needs to source from `booking.priceBreakdown.totalGuestPence` when payments go live.
- Extra-guest-fee host UI is still V1 read-only. `PriceInputModal` exists and can be reused, but extra-guest needs both a threshold and a per-night amount, so it needs either a second two-field modal or an extension of the current one.
- Stripe pass-through is a flat 3% — slightly over-charges vs UK Stripe's 1.5–2.9% + 20p. Safe direction; flag for finance review before launch.
