import { useState } from 'react';
import type { GuestCounts } from './listing-guest-types';
import { DEFAULT_GUEST_COUNTS } from './listing-guest-types';

export function useListingBookingState() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null,
  );
  const [guests, setGuests] = useState<GuestCounts>(DEFAULT_GUEST_COUNTS);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleDateSave = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateModalOpen(false);
  };

  const handleGuestSave = (g: GuestCounts) => {
    setGuests(g);
    setGuestModalOpen(false);
  };

  return {
    dateRange,
    guests,
    dateModalOpen,
    setDateModalOpen,
    guestModalOpen,
    setGuestModalOpen,
    confirmModalOpen,
    setConfirmModalOpen,
    handleDateSave,
    handleGuestSave,
  };
}
