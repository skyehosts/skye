import { differenceInCalendarDays } from 'date-fns';
import type { GuestCounts } from '../listings/listing-guest-types';

export interface Quote {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: 'GBP';
}

export interface UseQuoteParams {
  listingId: number;
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
}

// TODO: replace with real /listings/{id}/quote endpoint once available.
// Keeping a clean signature so the swap is internal to this hook.
const STUB_NIGHTLY_RATE = 120;
const STUB_CLEANING_FEE = 25;
const STUB_SERVICE_FEE_RATE = 0.12;

export function useQuote({ dateRange }: UseQuoteParams): Quote | null {
  if (!dateRange) return null;

  const nights = differenceInCalendarDays(dateRange.to, dateRange.from);
  if (nights <= 0) return null;

  const subtotal = STUB_NIGHTLY_RATE * nights;
  const serviceFee = Math.round(subtotal * STUB_SERVICE_FEE_RATE);
  const total = subtotal + STUB_CLEANING_FEE + serviceFee;

  return {
    nightlyRate: STUB_NIGHTLY_RATE,
    nights,
    subtotal,
    cleaningFee: STUB_CLEANING_FEE,
    serviceFee,
    total,
    currency: 'GBP',
  };
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}
