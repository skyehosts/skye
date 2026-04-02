# Listing Deletion

## Overview

Hosts can permanently delete a listing from the settings screen in the listing editor. Deletion is owner-only (`DELETE_LISTING` permission) and requires the host to type "delete" to confirm.

## Key constraints

- **Future bookings block deletion.** If any confirmed bookings have a `checkOutDate` after today, the API returns 400. The host must cancel them first.
- **Hard delete.** The listing and all related data are permanently removed — no soft-delete or archival.
- **S3 images are orphaned.** `ListingImage` rows cascade-delete from the database, but the actual files in S3/CloudFront remain. This is accepted (negligible cost) and can be cleaned up with a future job.

## Deletion sequence (FK constraint order)

All deletions run inside a single database transaction:

1. `SentMessage` (FK → `ScheduledMessage`)
2. `MessageLog` (FK → `ScheduledMessage`)
3. `ScheduledMessage` (FK → `Listing`)
4. `Booking` (FK → `Listing`)
5. `CoHostInvite` (FK → `Listing`)
6. `ListingUserRole` (FK → `Listing`)
7. `Favourite` (FK → `Listing`)
8. `CalendarBlock` (FK → `Listing`)
9. `CalendarSync` (FK → `Listing`)
10. `Listing` — cascade-deletes `ListingImage` and `ListingMessageTemplate`

## Frontend flow

1. Listing editor app bar → cog icon (owner-only) → settings screen
2. Settings screen shows a warning InfoBox and "Delete listing" button
3. Confirmation modal requires typing "delete" before submission
4. On success, redirects to listings tab

## Key files

- `apps/skye-hosts-api/src/modules/listing/providers/listing.service.ts` — `delete()` method
- `apps/skye-hosts-api/src/modules/listing/controllers/listing.controller.ts` — `DELETE /listing/:id`
- `apps/skye-hosts-app/app/edit-listing/listing-settings.tsx` — settings screen with delete modal
- `apps/skye-hosts-app/app/edit-listing/[id].tsx` — cog icon in app bar
