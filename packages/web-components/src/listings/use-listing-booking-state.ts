import { useState } from 'react';
import type { GuestCounts } from './listing-guest-types';
import { DEFAULT_GUEST_COUNTS } from './listing-guest-types';

interface UseListingBookingStateOptions {
  initialDateRange?: { from: Date; to: Date } | null;
  initialGuests?: GuestCounts;
  onBookingChange?: (
    dateRange: { from: Date; to: Date } | null,
    guests: GuestCounts,
  ) => void;
}

export function useListingBookingState(
  options?: UseListingBookingStateOptions,
) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    options?.initialDateRange ?? null,
  );
  const [guests, setGuests] = useState<GuestCounts>(
    options?.initialGuests ?? DEFAULT_GUEST_COUNTS,
  );
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const handleDateSave = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateModalOpen(false);
    options?.onBookingChange?.(range, guests);
  };

  const handleDateClear = () => {
    setDateRange(null);
    options?.onBookingChange?.(null, guests);
  };

  const handleGuestSave = (g: GuestCounts) => {
    setGuests(g);
    setGuestModalOpen(false);
    options?.onBookingChange?.(dateRange, g);
  };

  const handleGuestChange = (g: GuestCounts) => {
    setGuests(g);
    options?.onBookingChange?.(dateRange, g);
  };

  return {
    dateRange,
    guests,
    dateModalOpen,
    setDateModalOpen,
    guestModalOpen,
    setGuestModalOpen,
    handleDateSave,
    handleDateClear,
    handleGuestSave,
    handleGuestChange,
  };
}
