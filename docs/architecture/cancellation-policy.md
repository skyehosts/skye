# Cancellation Policy

## Overview

Hosts select a short-term cancellation policy for each listing. The policy determines refund windows shown to guests.

## Data model

- **Column**: `listing.cancellationPolicyShortTerm` — `character varying`, non-nullable, defaults to `5_days`.
- **Enum**: `CancellationPolicyShortTermId` in `@repo/skye-hosts-api-client` — values: `5_days`, `14_days`, `30_days`.
- Named `*ShortTerm` to leave room for a future `cancellationPolicyLongTerm` column (stays 28+ nights).

## Options config

`CANCELLATION_POLICY_SHORT_TERM_OPTIONS` in `listing-enums.ts` defines each option's `title` and `refundDetails` array. This is the single source of truth — the host app reads it directly for the selection UI.

## Host app flow

1. **Edit listing > Bookings section** — "Cancellation Policy" card shows the current policy label (or "Add details").
2. **Tap card** → navigates to `edit-listing/cancellation-policy` page.
3. **Page contents**: subtitle with "full policies" link (opens modal), info text about short-term stays, and selection cards for each policy option.
4. **Save** → `PATCH /listing/{id}` with `{ cancellationPolicyShortTerm }`.

## Guest website flow

### Things to know section

The "Things to know" section on the listing detail page shows a cancellation policy card. Behaviour depends on whether the guest has selected dates:

- **No dates selected**: Shows "Add your trip dates to get the cancellation details for this stay." with an "Add dates" link that opens the date picker.
- **Dates selected**: Shows "Free cancellation before {date}. Cancel before check-in on {date} for a partial refund." with a "Learn more" link that opens the cancellation policy modal.

### Date context (BookingDateContext)

`ListingThingsToKnowSection` needs access to the selected date range and the ability to open the date picker. This is achieved via `BookingDateContext`:

- **Provider**: `BookingDateProvider` wraps the page content inside `BookingParamsSync`, exposing `dateRange` and `openDatePicker`.
- **Consumer**: `useBookingDate()` hook used by `ListingThingsToKnowSection`.
- **Page structure**: `BookingParamsSync` was restructured to accept a `leftColumn` prop (the main content) and render the two-column layout internally, so all content sits within the context provider.

### Cancellation policy modal

`ListingCancellationPolicyModal` (Dialog) shows:

1. A bordered box with two rows — full refund cutoff and partial refund cutoff, each showing the date, time, and refund description.
2. Timezone disclaimer.
3. "View full policy" link → `/cancellation-policies` page.

### Date calculation

`getCancellationCutoffs()` in `cancellation-policy-utils.ts` computes:

- `freeCancellationDate` = check-in date minus policy days (5, 14, or 30)
- `partialRefundDate` = check-in date
- `cutoffTime` = listing's `checkInTimeStart` or `15:00` fallback

### /cancellation-policies page

Static page following the terms/privacy pattern (`PageContainer` + `HeadingPanel` + `PrincipalColumn`). Content is a todo placeholder.

## Design decisions

- **Selection cards over radio buttons** (host app): Each option has two lines of refund detail text. Cards provide enough visual space and match the existing booking type selection pattern.
- **Not nullable**: Pre-production, so all listings default to `5_days` rather than requiring a migration with nullable handling.
- **"Full policies" modal** (host app): Placeholder (Lorem Ipsum) — will be replaced with real legal text.
- **BookingDateContext over DOM events**: Context provides explicit, type-safe, React-idiomatic cross-component communication between the date picker and the Things to Know section.
