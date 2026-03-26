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

export interface ListingBookingStateProps {
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
  dateModalOpen: boolean;
  setDateModalOpen: (open: boolean) => void;
  guestModalOpen: boolean;
  setGuestModalOpen: (open: boolean) => void;
  confirmModalOpen: boolean;
  setConfirmModalOpen: (open: boolean) => void;
  handleDateSave: (range: { from: Date; to: Date }) => void;
  handleGuestSave: (guests: GuestCounts) => void;
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

function toDateOnly(iso: string): Date | null {
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

function formatDateParam(d: Date): string {
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
    if (guests[key] !== DEFAULT_GUEST_COUNTS[key]) {
      result[key] = String(guests[key]);
    }
  }

  return result;
}
