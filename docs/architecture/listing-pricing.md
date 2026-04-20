# Listing pricing

Pricing for Air-BnB-style listings. Hosts set **net income per night** (what lands in their bank); the system layers ~6% platform fees on top so the guest-facing price lands roughly 12% below Airbnb for the same host take.

## Storage

All monetary values are integer pence. Pounds conversion happens only at UI boundaries.

| Entity (`apps/skye-hosts-api/src/modules/listing/entities/`) | Shape                                                                                                                                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listing_season_pricing`                                     | one row per (listing, season). Seasons are fixed: `low` (Nov–Feb), `shoulder` (Mar–Apr + Sep–Oct), `peak` (May–Aug). Weekday vs weekend base rates; weekend = Fri + Sat nights platform-wide. |
| `listing_pricing`                                            | singleton per listing. Cleaning fee (default 100p = £1, backend-only V1), extra-guest threshold + fee (backend-only V1), three discount flags + percents.                                     |
| `listing_price_override`                                     | one row per (listing, date). Replaces the nightly rate for that date; cleaning, extra-guest, and discounts still apply.                                                                       |

Booking carries a frozen `priceBreakdown: IPriceBreakdownDto` JSONB column — historical pricing never mutates when seasons or discounts are later edited. `booking.totalPrice` (pounds) stays consistent with `priceBreakdown.totalGuestPence / 100`.

## Shared math — `packages/common/src/pricing/`

Pure, no IO, consumed by API, host app, and guest website. DTO-shaped types (`IPriceBreakdownDto`, `IQuoteRequestDto`, etc.) live in `types.ts` here alongside the math — **not** in `@repo/skye-hosts-api-client`. They're domain shapes the math anchors to, and keeping them next to the math avoids a dependency cycle (`api-client → common` for `Environments` already exists). Import pricing types from `@repo/common` directly.

- `constants.ts` — single source of truth for all fee rates and discount thresholds. `HOST_FEE_RATE` (0.03), `GUEST_FEE_SHORT_STAY_RATE` (0.03, stays ≤ 2 nights), `GUEST_FEE_LONG_STAY_RATE` (0, stays ≥ 3 nights), `STRIPE_PASS_THROUGH_RATE` (0.03), `LAST_MINUTE_DISCOUNT_MAX_DAYS` (14), `WEEKLY_DISCOUNT_MIN_NIGHTS` (7), `MONTHLY_DISCOUNT_MIN_NIGHTS` (28), `WEEKEND_NIGHT_WEEKDAYS = [5, 6]`.
- `seasons.ts` — `getSeasonForDate`, `isWeekendNight`.
- `discounts.ts` — `resolveApplicableDiscounts(ctx)`. **Stacking rule:** last-minute stacks with best-of(weekly, monthly); weekly and monthly are mutually exclusive.
- `calculate-quote.ts` — single entry point. Order of application is deliberate: per-night rate (override OR season weekday/weekend) → sum → extra-guest fee → cleaning fee → discounts (multiplicative) → guest fee tier (by nights) → Stripe pass-through → host fee → host payout. Per-step `Math.round`; ±1p drift tolerated end-to-end.
- `format-gbp.ts` — pence-based. **All frontend price rendering must consume pence and use this formatter.** The earlier pounds-based local helper in `packages/web-components/src/booking/use-quote.ts` was deleted.

## API surface — listing module

Two controllers under `apps/skye-hosts-api/src/modules/listing/controllers/`:

- `listing-pricing.controller.ts` (host-only, ownership-asserted via `ListingAccessService`):
  - `GET /listing/:id/pricing` — full config (3 seasons + globals + `isComplete`).
  - `PUT /listing/:id/pricing/seasons/:season` — upsert one season.
  - `PUT /listing/:id/pricing/discounts` — upsert discounts + cleaning + extra-guest block.
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

- `apps/skye-hosts-app/app/edit-listing/pricing.tsx` — main screen. Three season cards + cleaning-fee card + extra-guest-fee card (both V1 read-only) + discounts section with live-saved toggles. Fetches on focus; discount edits debounce 250ms before PUT. Warning InfoBox surfaces when `!pricing.isComplete`.
- `apps/skye-hosts-app/app/edit-listing/pricing/season-wizard-modal.tsx` — full-screen two-stage modal. Stage 1: weekday price with expandable `GuestPriceBreakdown`. Stage 2: weekend price with "% over weekday" / "set directly" toggle. On first save of any season, prompts to apply to the other two (Shoulder at −15%, Low at −30%).
- `apps/skye-hosts-app/app/edit-listing/bookings-section.tsx` — pricing card shows "Peak £X · Shoulder £Y · Low £Z" once configured, and a warning chip when incomplete and not yet active.
- Calendar (`apps/skye-hosts-app/app/calendar/[id].tsx`): fetches calendar-prices + overrides alongside bookings/blocks. `DayCell` renders the host-net below the day number in `typography.xs`; override dates use the primary-coloured semibold variant.
- `apps/skye-hosts-app/app/calendar/components/price-override-modal.tsx` — opened from `DateBlockSheet`'s "Set price override" action when the selected range contains at least one unblocked, unbooked date. Expands the range (iCal-style exclusive end) and PUTs `{ dates, pricePence }`; Remove path DELETEs the subset of dates that already had overrides.

## Guest website

`packages/web-components/src/booking/use-quote.ts` — calls `POST /listing/:id/quote` via `useEffect`, returns `IQuoteResponseDto | null`. The `Quote` type alias is kept for call-site stability but now resolves to `IPriceBreakdownDto`. `packages/web-components/src/booking/booking-payment-section.tsx` reads pence fields directly (`totalGuestPence`, `nightlyRateSumPence`, `cleaningFeePence`, `guestFeePence + stripeFeePence`) and renders via `formatGbp` from `@repo/common`. Applied discounts are listed as negative line-items. `GuestCounts.infants` maps to the backend's `babies` field (babies are excluded from the extra-guest count).

## Testing

- Unit: `packages/common/src/pricing/calculate-quote.spec.ts` — 20 cases covering season boundaries, discount stacking, extra-guest (babies excluded), override nights, guest-fee tier flip at 3 nights, rounding tolerance, zero-night rejection.
- E2E seed: `e2e-seed.service.ts` produces both a fully-priced listing and an un-priced listing for publishing-guard coverage.
- Seed service (`SeedService`) creates default pricing rows on every new listing so listings are immediately quote-able for internal dev.

## Open items

- `PaymentService` (`apps/skye-hosts-api/src/modules/payment/providers/payment.service.ts`) still has a stub `amount: 100, currency: 'usd'`. It needs to source from `booking.priceBreakdown.totalGuestPence` when payments go live.
- Cleaning-fee and extra-guest-fee host UI is deferred to V2; pre-launch, custom values require a SQL update.
- Stripe pass-through is a flat 3% — slightly over-charges vs UK Stripe's 1.5–2.9% + 20p. Safe direction; flag for finance review before launch.
