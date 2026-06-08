'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buildBookingUrl } from '../booking/booking-params';
import type { GuestCounts } from './listing-guest-types';

export interface UseReserveFlowParams {
  isAuthenticated: boolean;
  listingId: number;
  listingTitle: string;
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
}

export function useReserveFlow({
  isAuthenticated,
  listingId,
  listingTitle,
  dateRange,
  guests,
}: UseReserveFlowParams) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const bookingUrl = buildBookingUrl({
    listingId,
    listingTitle,
    dateRange,
    guests,
  });

  const handleReserveClick = () => {
    if (isAuthenticated) {
      router.push(bookingUrl);
    } else {
      setModalOpen(true);
    }
  };

  const handleAuthenticated = () => {
    setModalOpen(false);
    router.push(bookingUrl);
  };

  return {
    handleReserveClick,
    modalOpen,
    setModalOpen,
    bookingUrl,
    handleAuthenticated,
  };
}
