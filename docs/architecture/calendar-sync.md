# Calendar Sync

Allows hosts to sync their listing calendar with external platforms (AirBnB, Booking.com) to prevent double bookings.

## Overview

Two sync directions exist per platform connection:

- **Import** — host pastes their external platform's iCal URL; Skye polls it every 3h and creates `CalendarBlock` records for booked dates
- **Export** — Skye generates a unique iCal URL for each sync; host pastes this into their external platform so bookings made on Skye are reflected there

`importUrl` is **required** on every sync — the one-way export-only flow has been removed because it offered no real protection against double bookings. Both directions are always configured.

## Key entities

- `CalendarSync` — one record per listing+platform connection. Stores `importUrl` (NOT NULL), `exportToken`, failure counter, last import status, and `lastExportedAt` (timestamp of the last time the external platform fetched the iCal feed — see [Export tracking](#export-tracking)).
- `CalendarBlock` — a blocked date range. `source = 'import'` (from external calendar) or `'manual'` (host blocked directly). `calendarSyncId` is nullable: it is `null` for manual blocks (no parent sync), and always set for imported blocks (deleting a sync cascades its imported blocks — see [Sync deletion](#sync-deletion)).

## Enable/disable model

There are no explicit enable/disable toggles. State is inferred:

- **Import**: enabled by default (`importUrl` is required). Reaching 10 consecutive permanent failures auto-pauses it; saving a new URL re-enables it.
- **Export**: always enabled for any existing sync. The export URL is an unguessable UUID token — hosts opt in by pasting it into the external platform.

## Frontend layout

The summary card on the listing edit screen and the dedicated calendar-sync screen both use a shared `CalendarSyncColumns` component (`apps/skye-hosts-app/app/components/calendar-sync-columns.tsx`) to render Import / Export side-by-side per sync. The component stacks vertically below 360px viewport width. The aggregate health dot (also used in the calendar header in `app/calendar/[id].tsx`) reflects the worst of import + export health across all syncs.

### Health dot semantics

The dot answers a single question for the host: **do I need to act?** The classification lives in `apps/skye-hosts-app/app/utils/sync-status.tsx` and is covered by `sync-status.spec.ts`.

Per-direction health is collapsed to one of four buckets, then the combined sync health is the worst of `{importHealth, exportHealth}`:

- `error` (red) — `lastImportStatus = 'error'` or `consecutiveFailures >= 10` (auto-disabled). Action required.
- `stale` (orange) — last successful import > 6h ago. Action may be required.
- `warning` (orange) — export has never been fetched AND > 24h have elapsed since sync creation. Host probably mispasted the export link into the external platform.
- `healthy` (green) — everything else, **including benign no-data-yet states**:
  - import has never run (first cron hasn't landed)
  - export has never been fetched but we're still inside the 24h grace period

The key design rule: _absence of data is not the same as a problem._ A brand-new sync whose import already ran but whose external platform hasn't polled yet must show green — grey would falsely imply the host needs to act. Grey is reserved for the aggregate case with zero configured syncs (`getAggregateSyncHealthColor([])`).

The `unknown` bucket still exists in the `SyncHealth` union for that empty-aggregate case, but neither `getImportHealth` nor `getExportHealth` returns it — they fall through to `healthy` when there's no data and no active warning condition.

### Export column states

The Export column in `CalendarSyncColumns` discriminates three states with state-aware copy, a tappable info/warning icon, and (in the overdue state) a call-to-action InfoBox. See `sync-status.tsx` → `isExportPendingWarning` for the threshold:

- **pending** — `lastExportedAt` null, sync ≤ 24h old. Neutral copy and info icon; tooltip explains the grace period.
- **overdue** — `lastExportedAt` null, sync > 24h old. Warning-colored copy, alert icon, and InfoBox prompting the host to tap the card and re-paste the export link.
- **healthy** — `lastExportedAt` set. Shows relative time; tooltip explains that the external platform polls automatically.

## Import flow

1. `CalendarImportSchedulerService` cron (every 3h prod, 60s local) queries all syncs where `importUrl IS NOT NULL` and `consecutiveFailures < 10`.
2. For each, `CalendarImportService.importSingleSync()` fetches the iCal URL, parses it via `IcalParserService`, then reconciles blocks (insert/update/delete) inside a transaction.
3. On success: `consecutiveFailures` resets to 0.
4. On failure: see **Auto-disable** below.

## Export flow

Each `CalendarSync` has an `exportToken` (UUID) generated on creation. The export endpoint is public and returns an iCal feed of Skye bookings for that listing.

The host must manually paste the export URL into their external platform — Skye cannot push to it directly.

### Export tracking

`CalendarExportService.generateIcal()` writes `lastExportedAt = now()` on every successful fetch. There is no throttling or audit history — external platforms poll roughly hourly so volume is trivial. The frontend uses this single field to:

- Show "Exported {relative time}" in the Export column on the calendar-sync screens.
- Surface a warning info-box if a sync is older than 24 hours and `lastExportedAt` is still null. This is the primary signal that the host pasted the wrong link, or never pasted it at all, on the external platform.

The 24-hour threshold lives in `apps/skye-hosts-app/app/utils/sync-status.tsx` (`EXPORT_WARNING_AGE_HOURS`). It does NOT detect regression (was exporting, then stopped) — that is left for a future "no exports in 7 days" check.

## Auto-disable (import)

After repeated permanent import failures the sync is auto-paused to avoid repeatedly hitting a dead URL.

### Error categorisation

Not all failures are equal. Errors are classified before deciding whether to increment `consecutiveFailures`:

**Permanent** (increments counter): 4xx HTTP errors (404 bad URL, 401 expired credentials, 403 forbidden), iCal parse errors.

**Transient** (counter unchanged): 5xx server errors, 429 rate-limited, `AbortError` (10s timeout), `TypeError` (network-level: ECONNREFUSED, ENOTFOUND). These indicate infrastructure issues, not a bad URL.

At **10 consecutive permanent failures** the scheduler stops picking up the sync (since `consecutiveFailures >= 10`). A single successful import resets the counter to 0.

### Re-enabling after auto-disable

When the host edits the sync and saves a new `importUrl`, the service detects `consecutiveFailures >= 10` and automatically resets the counter to 0 and clears `lastImportError`.

The listing card surfaces: _"Import paused after repeated failures. Edit to update URL and re-enable."_

## Sync deletion

`DELETE /calendar-sync/:id` removes the `CalendarSync` row **and** all `CalendarBlock` rows belonging to it, in a single transaction. There is no "keep data" branch — the previous version offered one, but it produced orphaned imported blocks (no parent sync, so no platform identity, no styling, no individual delete affordance) that confused hosts more than they helped.

If a host wants their data back after deletion, they re-add the sync. The next iCal fetch repopulates everything from the source of truth.

The frontend confirm modal (`apps/skye-hosts-app/app/edit-listing/calendar-sync-form.tsx`) shows the count of imported dates that will be removed (using `lastImportEventCount`) and reassures the host that re-adding the calendar will restore them.

## Sentry tagging

All import errors are sent to Sentry with tags: `calendarSyncId`, `listingId`, `platform`, `errorType` (`'transient'` or `'permanent'`). Use these to filter auto-disable incidents.
