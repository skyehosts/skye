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
