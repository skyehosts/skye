import { WEEKEND_NIGHT_ISO_WEEKDAYS } from './constants';
import type { PricingSeasonId } from './types';

/** Format a Date as local `YYYY-MM-DD` (timezone-safe, unlike `toISOString().slice(0, 10)`). */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Return the season that a given calendar date falls within. */
export function getSeasonForDate(date: Date): PricingSeasonId {
  const month = date.getMonth() + 1;
  if (month >= 5 && month <= 8) return 'peak';
  if (month === 3 || month === 4) return 'shoulder';
  if (month === 9 || month === 10) return 'shoulder';
  return 'low';
}

/**
 * Is this night a weekend night? A night is named by its check-in day:
 * Fri-night = night starting Friday, Sat-night = night starting Saturday.
 */
export function isWeekendNight(date: Date): boolean {
  const dow = date.getDay() === 0 ? 7 : date.getDay();
  return WEEKEND_NIGHT_ISO_WEEKDAYS.includes(dow);
}
