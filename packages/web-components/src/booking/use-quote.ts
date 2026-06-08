'use client';

import type { IQuoteRequestDto, IQuoteResponseDto } from '@repo/common';
import { fetchApi } from '@repo/skye-hosts-api-client';
import { useEffect, useState } from 'react';
import {
  formatDateParam,
  type GuestCounts,
} from '../listings/listing-guest-types';

export type Quote = IQuoteResponseDto;

export interface UseQuoteParams {
  listingId: number;
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
}

export function useQuote({
  listingId,
  dateRange,
  guests,
}: UseQuoteParams): Quote | null {
  const [quote, setQuote] = useState<Quote | null>(null);

  const checkInDate = dateRange ? formatDateParam(dateRange.from) : null;
  const checkOutDate = dateRange ? formatDateParam(dateRange.to) : null;

  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const body: IQuoteRequestDto = {
      checkInDate,
      checkOutDate,
      guestCount: {
        adults: guests.adults,
        children: guests.children,
        babies: guests.infants,
      },
    };
    fetchApi<IQuoteResponseDto, IQuoteRequestDto>(
      `/listing/${listingId}/quote`,
      body,
    )
      .then((res) => {
        if (!cancelled) setQuote(res);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    listingId,
    checkInDate,
    checkOutDate,
    guests.adults,
    guests.children,
    guests.infants,
  ]);

  return quote;
}
