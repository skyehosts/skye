import type { IMinNightsByCheckInDay } from "@repo/skye-hosts-api-client";
import { formatDateString } from "./format-date-string";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const satisfies readonly (keyof IMinNightsByCheckInDay)[];

function getMinNightsForDate(
  date: Date,
  minNights: number,
  minNightsByCheckInDay: IMinNightsByCheckInDay | null,
): number {
  if (!minNightsByCheckInDay) return minNights;
  const key = DAY_KEYS[date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6];
  return minNightsByCheckInDay[key];
}

function toDateString(d: Date): string {
  return formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return result;
}

/**
 * Compute dates that are available but unbookable because the gap to
 * the next occupied date is smaller than the minimum nights requirement.
 *
 * Returns an empty set when minNights <= 1 (no gaps possible).
 */
export function computeRestrictedDates(
  occupiedDates: Set<string>,
  minNights: number,
  minNightsByCheckInDay: IMinNightsByCheckInDay | null,
  rangeStart: string,
  rangeEnd: string,
): Set<string> {
  const maxMin = minNightsByCheckInDay
    ? Math.max(...Object.values(minNightsByCheckInDay), minNights)
    : minNights;

  if (maxMin <= 1) return new Set();

  const restricted = new Set<string>();
  const start = new Date(rangeStart + "T00:00:00");
  const end = new Date(rangeEnd + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (d < today) continue;

    const ds = toDateString(d);
    if (occupiedDates.has(ds)) continue;

    const effectiveMin = getMinNightsForDate(
      d,
      minNights,
      minNightsByCheckInDay,
    );
    if (effectiveMin <= 1) continue;

    // Check if the next (effectiveMin - 1) days are all available
    for (let offset = 1; offset < effectiveMin; offset++) {
      const futureDate = addDays(d, offset);
      if (occupiedDates.has(toDateString(futureDate))) {
        restricted.add(ds);
        break;
      }
    }
  }

  return restricted;
}
