import type { CalendarSyncPlatform } from "@repo/skye-hosts-api-client";

export const PLATFORM_OPTIONS = [
  { value: "airbnb" as const, label: "AirBnB" },
  { value: "booking_com" as const, label: "Booking.com" },
  { value: "other" as const, label: "Other" },
];

export const PLATFORM_HELP: Record<CalendarSyncPlatform, string> = {
  airbnb:
    "To find your calendar link in AirBnB: open your listing → tap Calendar → Availability Settings → scroll to 'Export Calendar' → copy the link.",
  booking_com:
    "To find your calendar link in Booking.com: open your property → Calendar & Pricing → Sync Calendars → copy the export link.",
  other:
    "Check your booking platform for a calendar export link (sometimes called an iCal or .ics link).",
};

export const PLATFORM_EXPORT_HELP: Record<CalendarSyncPlatform, string> = {
  airbnb:
    "To complete the sync, paste the export link into AirBnB:\n\n" +
    "1. Open the AirBnB app\n" +
    "2. Go to your listing\n" +
    "3. Tap Calendar\n" +
    "4. Tap Availability Settings\n" +
    "5. Scroll to 'Import Calendar'\n" +
    "6. Paste the link you copied and tap Submit",
  booking_com:
    "To complete the sync, paste the export link into Booking.com:\n\n" +
    "1. Log into Booking.com (extranet)\n" +
    "2. Go to Calendar & Pricing\n" +
    "3. Tap Sync Calendars\n" +
    "4. Under 'Import calendar', paste the link you copied\n" +
    "5. Name it (e.g. 'Skye Hosts') and save",
  other:
    "To complete the sync, import this link into your booking platform.\n\n" +
    "Look for an 'Import Calendar' or 'Subscribe to iCal' option in your platform's calendar settings, then paste the link you copied.",
};

export function getPlatformLabel(platform: CalendarSyncPlatform): string {
  return (
    PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? "External"
  );
}
