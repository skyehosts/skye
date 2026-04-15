import { addDays, format } from 'date-fns';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export const DEFAULT_GUEST_COUNTS: GuestCounts = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
};

export interface ListingGuestRuleProps {
  maxGuests: number;
  childrenAllowed: boolean;
  infantsAllowed: boolean;
  petsAllowed: boolean;
}

export interface GuestRow {
  key: keyof GuestCounts;
  label: string;
  subtitle: string;
  getMax: (counts: GuestCounts) => number;
  getMin: () => number;
}

export function buildGuestRows(
  maxGuests: number,
  childrenAllowed: boolean,
  infantsAllowed: boolean,
  petsAllowed: boolean,
): GuestRow[] {
  return [
    {
      key: 'adults',
      label: 'Adults',
      subtitle: 'Age 13+',
      getMax: (c) => maxGuests - c.children,
      getMin: () => 1,
    },
    {
      key: 'children',
      label: 'Children',
      subtitle: 'Ages 2–12',
      getMax: (c) => (childrenAllowed ? maxGuests - c.adults : 0),
      getMin: () => 0,
    },
    {
      key: 'infants',
      label: 'Infants',
      subtitle: 'Under 2',
      getMax: () => (infantsAllowed ? 5 : 0),
      getMin: () => 0,
    },
    {
      key: 'pets',
      label: 'Pets',
      subtitle: 'Service animals always welcome',
      getMax: () => (petsAllowed ? 5 : 0),
      getMin: () => 0,
    },
  ];
}

export function buildGuestInfoText(
  maxGuests: number,
  petsAllowed: boolean,
  childrenAllowed: boolean,
  infantsAllowed: boolean,
): string {
  let text = `This place has a maximum of ${maxGuests} guests, not including infants.`;
  if (!petsAllowed) text += " Pets aren't allowed.";
  if (!childrenAllowed) text += ' No children.';
  if (!infantsAllowed) text += ' No infants.';
  return text;
}

import type { IMinNightsByCheckInDay } from '@repo/skye-hosts-api-client';

export type { IMinNightsByCheckInDay } from '@repo/skye-hosts-api-client';

export interface ListingNightRuleProps {
  minNights: number;
  minNightsByCheckInDay: IMinNightsByCheckInDay | null;
  maxNights: number | null;
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const satisfies readonly (keyof IMinNightsByCheckInDay)[];

export function getMinNightsForDate(
  date: Date,
  minNights: number,
  minNightsByCheckInDay: IMinNightsByCheckInDay | null,
): number {
  if (!minNightsByCheckInDay) return minNights;
  const key = DAY_KEYS[date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6];
  return minNightsByCheckInDay[key];
}

export function formatNightConstraintMessage(
  effectiveMin: number,
  maxNights: number | null,
): string {
  if (maxNights !== null) {
    return effectiveMin === maxNights
      ? `${effectiveMin}-night stay required`
      : `Stay must be ${effectiveMin}–${maxNights} nights`;
  }
  return `Minimum stay: ${effectiveMin} night${effectiveMin !== 1 ? 's' : ''}`;
}

export function isNightCountValid(
  nights: number,
  effectiveMinNights: number,
  maxNights: number | null,
): boolean {
  if (nights < effectiveMinNights) return false;
  if (maxNights !== null && nights > maxNights) return false;
  return true;
}

export function formatLongDate(date: Date): string {
  return format(date, 'd MMMM yyyy');
}

export function formatGeneralConstraintMessage(
  minNights: number,
  minNightsByCheckInDay: IMinNightsByCheckInDay | null,
  maxNights: number | null,
): string | null {
  const hasPerDayMin = minNightsByCheckInDay !== null;
  const hasUniformMin = !hasPerDayMin && minNights > 1;
  const hasMax = maxNights !== null;

  if (hasPerDayMin && hasMax) return 'Minimum and maximum night stays apply';
  if (hasPerDayMin) return 'Minimum night stay varies by check-in day';
  if (hasUniformMin && hasMax) {
    return minNights === maxNights
      ? `${minNights}-night stay required`
      : `Stay must be ${minNights}–${maxNights} nights`;
  }
  if (hasUniformMin)
    return `Minimum stay: ${minNights} night${minNights !== 1 ? 's' : ''}`;
  if (hasMax)
    return `Maximum stay: ${maxNights} night${maxNights !== 1 ? 's' : ''}`;
  return null;
}

function buildNightRestrictedMatcher(
  from: Date | null,
  effectiveMinNights: number,
  maxNights: number | null,
) {
  if (!from) return [];
  const matchers: ({ before: Date; after: Date } | { after: Date })[] = [];
  if (effectiveMinNights > 1) {
    matchers.push({ before: addDays(from, effectiveMinNights), after: from });
  }
  if (maxNights !== null) {
    matchers.push({ after: addDays(from, maxNights) });
  }
  return matchers;
}

export function buildNightDisabledMatcher(
  from: Date | null,
  effectiveMinNights: number,
  maxNights: number | null,
  unavailableDates?: Set<string>,
) {
  const matchers: (
    | { before: Date }
    | { before: Date; after: Date }
    | { after: Date }
    | ((date: Date) => boolean)
  )[] = [
    { before: new Date() },
    ...buildNightRestrictedMatcher(from, effectiveMinNights, maxNights),
  ];

  if (unavailableDates && unavailableDates.size > 0) {
    if (from) {
      // When selecting checkout: find the first unavailable date after check-in
      // and disable everything beyond that point to prevent spanning over blocks.
      // The first blocked date itself IS allowed as a checkout date (same-day
      // turnover: current guest checks out, next guest checks in).
      const firstBlockedAfterFrom = findFirstUnavailableAfter(
        from,
        unavailableDates,
      );
      if (firstBlockedAfterFrom) {
        matchers.push({ after: firstBlockedAfterFrom });
        // Disable individual unavailable dates between check-in and the
        // boundary, but NOT the boundary itself (valid for checkout).
        const boundaryKey = format(firstBlockedAfterFrom, 'yyyy-MM-dd');
        matchers.push((date: Date) => {
          const key = format(date, 'yyyy-MM-dd');
          return unavailableDates.has(key) && key !== boundaryKey;
        });
      } else {
        matchers.push((date: Date) => {
          const key = format(date, 'yyyy-MM-dd');
          return unavailableDates.has(key);
        });
      }
    } else {
      // When selecting check-in: disable all unavailable dates
      matchers.push((date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        return unavailableDates.has(key);
      });
    }
  }

  return matchers;
}

function findFirstUnavailableAfter(
  from: Date,
  unavailableDates: Set<string>,
): Date | null {
  // Scan up to 730 days ahead (2 years)
  for (let i = 1; i <= 730; i++) {
    const d = addDays(from, i);
    if (unavailableDates.has(format(d, 'yyyy-MM-dd'))) {
      return d;
    }
  }
  return null;
}

export interface ListingBookingStateProps {
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
  dateModalOpen: boolean;
  setDateModalOpen: (open: boolean) => void;
  guestModalOpen: boolean;
  setGuestModalOpen: (open: boolean) => void;
  handleDateSave: (range: { from: Date; to: Date }) => void;
  handleDateClear: () => void;
  handleGuestSave: (guests: GuestCounts) => void;
  handleGuestChange: (guests: GuestCounts) => void;
}

export interface BookingSearchParams {
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
}

export function formatGuestSummary(guests: GuestCounts): string {
  const total = guests.adults + guests.children;
  let text = `${total} guest${total !== 1 ? 's' : ''}`;
  if (guests.infants > 0) {
    text += `, ${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`;
  }
  if (guests.pets > 0) {
    text += `, ${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`;
  }
  return text;
}

export function formatGuestBreakdown(guests: GuestCounts): string {
  const parts: string[] = [];
  parts.push(`${guests.adults} adult${guests.adults !== 1 ? 's' : ''}`);
  if (guests.children > 0) {
    parts.push(`${guests.children} child${guests.children !== 1 ? 'ren' : ''}`);
  }
  if (guests.infants > 0) {
    parts.push(`${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`);
  }
  if (guests.pets > 0) {
    parts.push(`${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`);
  }
  return parts.join(', ');
}

function parseIntSafe(
  value: string | undefined,
  min: number,
  fallback: number,
): number {
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min) return fallback;
  return parsed;
}

export function toDateOnly(iso: string): Date | null {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(iso);
  if (!match) return null;
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return d;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseBookingSearchParams(
  params: Record<string, string | undefined>,
): BookingSearchParams {
  let dateRange: { from: Date; to: Date } | null = null;

  const checkin = params.checkin ? toDateOnly(params.checkin) : null;
  const checkout = params.checkout ? toDateOnly(params.checkout) : null;

  if (
    checkin &&
    checkout &&
    checkin < checkout &&
    checkin >= stripTime(new Date())
  ) {
    dateRange = { from: checkin, to: checkout };
  }

  const guests: GuestCounts = {
    adults: parseIntSafe(params.adults, 1, 1),
    children: parseIntSafe(params.children, 0, 0),
    infants: parseIntSafe(params.infants, 0, 0),
    pets: parseIntSafe(params.pets, 0, 0),
  };

  return { dateRange, guests };
}

export function formatDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function serializeBookingSearchParams(
  dateRange: { from: Date; to: Date } | null,
  guests: GuestCounts,
): Record<string, string> {
  const result: Record<string, string> = {};

  if (dateRange) {
    result.checkin = formatDateParam(dateRange.from);
    result.checkout = formatDateParam(dateRange.to);
  }

  for (const key of Object.keys(
    DEFAULT_GUEST_COUNTS,
  ) as (keyof GuestCounts)[]) {
    result[key] = String(guests[key]);
  }

  return result;
}
