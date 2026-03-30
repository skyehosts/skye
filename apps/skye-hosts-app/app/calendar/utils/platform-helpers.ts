import type { CalendarSyncPlatform } from "@repo/skye-hosts-api-client";

export function getPlatformName(platform: CalendarSyncPlatform | null): string {
  switch (platform) {
    case "booking_com":
      return "Booking.com";
    case "airbnb":
      return "Airbnb";
    default:
      return "an external calendar";
  }
}
