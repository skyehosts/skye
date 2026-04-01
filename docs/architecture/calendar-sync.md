# Calendar Sync

Allows hosts to sync their listing calendar with external platforms (AirBnB, Booking.com) to prevent double bookings.

## Overview

Two sync directions exist per platform connection:

- **Import** — host pastes their external platform's iCal URL; Skye polls it every 3h and creates `CalendarBlock` records for booked dates
- **Export** — Skye generates a unique iCal URL for each sync; host pastes this into their external platform so bookings made on Skye are reflected there

Both directions must be configured for full two-way protection. One direction alone still risks double bookings.

## Key entities

- `CalendarSync` — one record per listing+platform connection. Stores `importUrl`, `exportToken`, enabled flags, failure counter, last sync status.
- `CalendarBlock` — a blocked date range. `source = 'import'` (from external calendar) or `'manual'` (host blocked directly). `calendarSyncId` is nullable — becomes `null` when the parent sync is deleted but blocks were retained.

## Import flow

1. `CalendarImportSchedulerService` cron (every 3h prod, 60s local) queries all syncs where `isImportEnabled = true` and `importUrl IS NOT NULL`.
2. For each, `CalendarImportService.importSingleSync()` fetches the iCal URL, parses it via `IcalParserService`, then reconciles blocks (insert/update/delete) inside a transaction.
3. On success: `consecutiveFailures` resets to 0.
4. On failure: see **Auto-disable** below.

## Export flow

Each `CalendarSync` has an `exportToken` (UUID) generated on creation. The export endpoint is public and returns an iCal feed of Skye bookings for that listing. When `isExportEnabled = false`, the endpoint returns 404.

The host must manually paste the export URL into their external platform — Skye cannot push to it directly.

## Auto-disable (import)

After repeated permanent import failures the sync is auto-disabled to avoid repeatedly hitting a dead URL.

### Error categorisation

Not all failures are equal. Errors are classified before deciding whether to increment `consecutiveFailures`:

**Permanent** (increments counter): 4xx HTTP errors (404 bad URL, 401 expired credentials, 403 forbidden), iCal parse errors.

**Transient** (counter unchanged): 5xx server errors, 429 rate-limited, `AbortError` (10s timeout), `TypeError` (network-level: ECONNREFUSED, ENOTFOUND). These indicate infrastructure issues, not a bad URL.

At **10 consecutive permanent failures** `isImportEnabled` is set to `false`. A single successful import resets the counter to 0.

### Re-enabling after auto-disable

When the host edits the sync and saves a new `importUrl`, the service detects `consecutiveFailures >= 10` and automatically resets the counter to 0 and sets `isImportEnabled = true` — unless the host explicitly toggled import off.

The listing card surfaces: _"Import paused after repeated failures. Edit to update URL and re-enable."_

## Orphaned blocks

When a host deletes a sync and chooses **"Remove sync only"** (not dates), `CalendarSync` is deleted but `CalendarBlock` records persist with `calendarSyncId = null`. These are orphaned imported blocks.

The calendar tooltip detects this state (`source = 'import'` AND `calendarSyncId = null`) and shows a **"Remove block"** button, allowing the host to clear them individually. Active imported blocks (live sync) instead show guidance to cancel on the external platform.

### Re-import after "delete sync only"

If a host re-creates a sync for the same iCal URL, `reconcileBlocks()` scopes to the new `calendarSyncId` — orphaned blocks are invisible to it, which would cause duplicate blocks for the same dates. To prevent this, `adoptOrphanedBlocks()` runs before reconciliation: it re-assigns any orphaned blocks whose `externalUid` matches an incoming event to the new sync ID. Reconciliation then finds them as existing records and updates rather than duplicating. Orphaned blocks with no matching UID are left alone (host can clear manually).

## Sentry tagging

All import errors are sent to Sentry with tags: `calendarSyncId`, `listingId`, `platform`, `errorType` (`'transient'` or `'permanent'`). Use these to filter auto-disable incidents.
