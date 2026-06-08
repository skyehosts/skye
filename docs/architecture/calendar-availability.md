# Calendar Availability

## Model: Available by Default

Skye Hosts uses an **available-by-default** model — all future dates on a listing are open for booking unless explicitly blocked. This is an implicit, non-configurable setting.

### Why available-by-default?

Highland hosts primarily operate April–October. Most use Airbnb as their master booking system with Airbnb's calendar set to "unavailable by default" to restrict off-season dates. Via iCal import, those off-season blocks flow into Skye Hosts automatically.

This means:

- Skye Hosts doesn't need its own seasonal availability system
- Airbnb is the source of truth for which dates are open
- Hosts manage one calendar (Airbnb) and both platforms stay in sync

### Rolling availability risk

Because dates are always open by default, new future dates continuously become bookable on Skye Hosts. If a host's Airbnb calendar has "unavailable by default" enabled and iCal import is active, those future dates will be blocked on the next import cycle (every 3 hours). There is a brief window where newly-rolled dates could theoretically be bookable before the import runs.

## Manual Date Blocking

Hosts can block or unblock date ranges directly on the Skye Hosts calendar via single tap (1-night range) or long-press + drag (multi-day range).

### Block creation flow

1. Host selects dates:
   - **Single tap** on a bookable cell → opens the sheet for a 1-night range (tapped day → tapped day + 1). Past and booked cells are no-oped; blocked and min-nights-restricted cells show their existing tooltips instead.
   - **Long-press + drag**: anchor on the press, cells highlight (blue) as the thumb moves, range commits on release.
2. Bottom sheet slides up with "Block these dates" / "Unblock these dates" / "Set price override"
3. Block action: `POST /calendar-sync/listing/:id/blocks` with `{ startDate, endDate }`
4. Calendar reloads to show the new block

Both entry points funnel through `CalendarList.onSelectionComplete(start, exclusiveEnd)` — the tap path synthesizes `exclusiveEnd = tappedDate + 1`, which matches iCal DTEND semantics and what a long-press without drag already produces. RN `Pressable`'s native `delayLongPress={400}` provides tap-vs-longpress discrimination; `selectionActiveRef` gates drag handlers so short taps never engage the selection machinery.

### Gesture discoverability

Long-press + drag is a hidden gesture, so `HelpTooltipButton` (floating outlined `?` in the bottom-right of `app/calendar/[id].tsx`) exposes it via a `PositionedTooltip` — the same tooltip primitive used by `ExternalBookingBar`. The button auto-hides whenever `DateBlockSheet` or `PriceOverrideModal` is open so it never competes with the active sheet.

### Unblock range logic

Unblocking is more complex because it may need to split existing blocks:

- `POST /calendar-sync/listing/:id/blocks/unblock-range` with `{ startDate, endDate }`
- Server finds all **manual** blocks overlapping the range (imported blocks are NOT affected)
- In a transaction:
  - Deletes all overlapping manual blocks
  - Creates trimmed blocks for portions outside the unblock range

Example: Manual block Oct 1–31, host unblocks Oct 10–20:

- Delete Oct 1–31 block
- Create Oct 1–10 block
- Create Oct 20–31 block

### Blocks can overlap bookings (by design)

The system allows manual blocks to be created on date ranges that include existing bookings (both Skye Hosts and imported Airbnb bookings). This is intentional — if a host blocks a wide range and a booking within that range is later cancelled, the block is already in place to keep those dates unavailable. Without this, cancellation would silently re-open dates the host intended to keep blocked.

The bottom sheet accounts for bookings when deciding which actions to show: booked dates (excluding check-out days, which allow same-day check-in) are treated as occupied. The "Block these dates" button only appears when genuinely free dates exist in the selection. If the entire selection is booked, the sheet shows "These dates already have a booking."

### Manual blocks are Skye-only

Manual blocks are **not exported** via iCal. The iCal export only includes:

- Bookings (as "Reserved" VEVENTs)
- Imported blocks (re-exported with original summary)

This prevents circular blocking: if manual blocks were exported to Airbnb and then re-imported, they would create duplicate blocks and confusion.

## Host Guidance

The calendar sync screen displays contextual guidance explaining the available-by-default model:

1. "Your Skye Hosts calendar is open by default"
2. "We recommend setting your Airbnb calendar to 'unavailable by default'"
3. "Bookings made on Skye Hosts are shared with connected calendars automatically"
4. "Manual blocks you create here stay on Skye Hosts only"

## Key files

| File                                                                            | Purpose                                            |
| ------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/skye-hosts-api/.../calendar-sync/providers/calendar-sync.service.ts`      | `unblockRange()` — transactional block splitting   |
| `apps/skye-hosts-api/.../calendar-sync/providers/calendar-export.service.ts`    | iCal export — filters out manual blocks            |
| `apps/skye-hosts-api/.../calendar-sync/controllers/calendar-sync.controller.ts` | `POST .../blocks/unblock-range` endpoint           |
| `apps/skye-hosts-app/app/calendar/[id].tsx`                                     | Calendar screen — wires selection to block/unblock |
| `apps/skye-hosts-app/app/calendar/components/calendar-list.tsx`                 | Drag-to-select gesture + coordinate mapping        |
| `apps/skye-hosts-app/app/calendar/components/date-block-sheet.tsx`              | Bottom sheet for block/unblock actions             |
| `apps/skye-hosts-app/app/calendar/components/day-cell.tsx`                      | Cell rendering including "selected" status         |
