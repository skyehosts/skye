# Booking Flow

## Overview

From the listing detail page, a guest clicks **Reserve** and — if dates are set — is taken (directly or after logging in) to `/book/[id]/[title]`, a multi-step page for confirming dates, guests, and (eventually) payment.

Unauthenticated users never leave the listing page during auth: a **Log in or sign up** modal handles both flows in-place before navigating to the booking page. The canonical `/login` and `/sign-up` routes still exist as fallbacks and for deep-linked callback URLs (e.g. from the `/book` server-side redirect).

## Routes

- `/listing/[id]/[title]` — listing detail. Reserve button lives in `BookingParamsSync` (sidebar + mobile bar).
- `/book/[id]/[title]?checkin=…&checkout=…&adults=…&children=…&infants=…&pets=…&step=review|payment` — booking page. Server component checks `auth()` and redirects unauthenticated users to `/login?callbackUrl=<current url>`.

Booking page sets `robots: { index: false, follow: false }` and a self-canonical to the bare `/book/[id]/[title]` path (no querystring) to keep session-specific URLs out of search engines.

## Shared vs app-level split

Both skye-hosts-guest-website and skye-glamping-website share the same React tree via `@repo/web-components`:

- **Shared** (`packages/web-components/src/booking/`): `BookingPage`, `BookingReviewSection`, `BookingPaymentSection`, `BookingWizard`, `useQuote`, `booking-params`.
- **Shared auth modal** (`packages/web-components/src/auth/log-in-or-sign-up-modal.tsx`): presentational, step-driven.
- **Shared wrapper** (`packages/web/src/wrappers/log-in-or-sign-up-modal-wrapper.tsx`): owns step + API calls + `signIn`.
- **App-level** per site: thin `app/book/[id]/[title]/page.tsx` server component; `BookingParamsSync` mounts `LogInOrSignUpModalWrapper` directly with the site's logo and `role="guest"`.

The glamping site's `/book` route exists so direct-linked URLs work, but the glamping listing page does **not** yet mount Reserve/sidebar — that's a follow-up.

## State and querystrings

Booking state (dateRange + guests) lives in the URL. This lets refresh, share, and back-button work predictably.

- Listing page: `BookingParamsSync` reads params via `parseBookingSearchParams`, manages state with `useListingBookingState`, and pushes changes back to the URL via `router.replace` (no history bloat on date/guest tweaks).
- Booking page: `BookingPage` does the same using `buildBookingUrl`, plus threads a `?step` param for the mobile wizard.

`serializeBookingSearchParams` omits default values (adults=1, children=0, etc.) so URLs stay short.

### Mobile wizard history semantics

- `review → payment`: `router.push` — adds a history entry, so the browser **Back** button returns to step 1.
- `payment → review` via the wizard's **Back** button: `router.replace` — avoids history bloat when the user is deliberately stepping back via UI.
- Date/guest changes inside either step: `router.replace`.
- Wizard **X close**: `router.push` back to `/listing/[id]/[title]` with booking params preserved.

Desktop renders both sections side-by-side and ignores `?step`.

## Reserve button and auth gate

`useReserveFlow` (shared hook) takes `{isAuthenticated, listingId, listingTitle, dateRange, guests}` and returns:

- `handleReserveClick` — if authed, `router.push(bookingUrl)`; else sets `modalOpen=true`.
- `handleAuthenticated` — fires from the modal on successful login/signup, navigates to the current `bookingUrl`.

`bookingUrl` is recomputed on every render, so by the time the user completes auth, any state changes they made while the modal was open (e.g. switching dates from within the listing page — not currently possible, but robust) would be reflected.

`BookingParamsSync` mounts `LogInOrSignUpModalWrapper` with `role="guest"` and the site-specific logo — no intermediate passthrough component.

## Log in or sign up modal: check-email flow

Rather than asking up-front whether the user has an account, the modal starts with a single **Email** field:

1. User enters email and clicks Continue.
2. Wrapper calls `POST /auth/check-email` → `{ exists: boolean }`.
3. Modal transitions to either the **Login** step (password + Forgot password link → navigates to `/forgot-password`, closing the modal) or the **Sign up** step (name + password + confirm + T&C — **no newsletter**; see "Newsletter removal" below).
4. On successful login/signup, wrapper calls `signIn('credentials', {redirect:false})` and fires `onAuthenticated()`.

Social login buttons (Google/Facebook) are rendered but disabled — placeholders for a future integration.

### Email enumeration

The check-email endpoint intentionally returns `{exists}` — this is a well-known enumeration surface. See [security.md](./security.md) for the threat model and phase-1 mitigations (rate limiting, constant DB work, identical response shape).

## Pricing stub

No pricing endpoint exists yet. `useQuote` in `packages/web-components/src/booking/use-quote.ts` returns a deterministic stub from the date range (fixed nightly rate, fixed cleaning fee, percentage service fee). The hook signature `{listingId, dateRange, guests}` matches what the real endpoint will need, so the swap is internal to the hook.

## "Name" field in signup (not email-only + Stripe name)

Stripe can capture billing name at payment time, so in a pure pay-immediately flow the Name field on signup would be redundant. We keep it because the **Request to Book** feature (not yet built) requires host↔guest messaging **before** any Stripe checkout happens. Messaging needs a real name, so Name is collected at signup rather than bolted on later.

## Newsletter removal

The standalone `/sign-up` route previously had a "subscribe to our newsletter" checkbox. This was removed from both `SignUpForm` (the shared component) and the guest-website wrapper. The modal signup step never had it. The API DTO still accepts `subscribedToNewsViaEmail: boolean`, and both paths now hard-code `false`.

## Dev-only test booking

`BookingPaymentSection` renders a dev-only `TestBookingPanel` under the "Add a payment method" card, gated on `process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT !== Environments.PRODUCTION` (so it shows in **local + qa** but is hidden in prod). The panel's **Create test booking** button POSTs to `/payment/process-booking-payment` with the user's real `listingId` / `guestId` / `dateRange` / `quote.total` plus `isTestBooking: true`, then redirects to `/booking-confirmed?listingId=…&checkin=…&checkout=…`.

This preserves the capability the now-deleted `BookNowButton` provided: a one-click way to exercise the full post-payment pipeline (SQS → booking row → scheduled messages) without real card input. Server-side, `ScheduledMessageCreationService` detects `isTestBooking` and schedules messages at 0/1/2/3-minute offsets from now, so the check-in/out dates you submit only affect the persisted Booking row — they don't influence message timing.

Because `/payment/process-booking-payment` enqueues an SQS message rather than returning the new bookingId synchronously, the confirmation route is query-string-driven (`/booking-confirmed?listingId=…`), not `/booking-confirmed/[id]`. The page fetches the listing, shows a confirmation card with title + dates, and links to `/messages` where the scheduled test messages will appear a few minutes later.

## Removed components

Deleted as part of this change:

- `packages/web-components/src/listings/listing-confirm-pay-modal.tsx` — the "Lorem ipsum" placeholder modal the Reserve button used to open.
- `apps/skye-hosts-guest-website/app/listing/[id]/[title]/BookNowButton.tsx` — a dummy button wired to hardcoded dates/price; superseded by the real `/book` page. Its dev-only test-booking affordance now lives in `TestBookingPanel` (see "Dev-only test booking" above).
- The "Log in to book" `<Link>` on the listing page — unauthenticated users now hit the Reserve CTA and the modal.

`confirmModalOpen` / `setConfirmModalOpen` fields were dropped from `ListingBookingStateProps` and `useListingBookingState`.
