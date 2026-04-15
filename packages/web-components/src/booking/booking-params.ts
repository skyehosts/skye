import { slugify } from '@repo/skye-hosts-api-client';
import {
  GuestCounts,
  serializeBookingSearchParams,
} from '../listings/listing-guest-types';

export type BookingStep = 'review' | 'payment';

export interface BuildBookingUrlParams {
  listingId: number;
  listingTitle: string;
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
  step?: BookingStep;
}

export function buildBookingUrl({
  listingId,
  listingTitle,
  dateRange,
  guests,
  step,
}: BuildBookingUrlParams): string {
  const params = serializeBookingSearchParams(dateRange, guests);
  if (step === 'payment') {
    params.step = 'payment';
  }
  const qs = new URLSearchParams(params).toString();
  const base = `/book/${listingId}/${slugify(listingTitle)}`;
  return qs ? `${base}?${qs}` : base;
}

export function parseBookingStep(
  value: string | null | undefined,
): BookingStep {
  return value === 'payment' ? 'payment' : 'review';
}

export function buildLoginRedirect(callbackUrl: string): string {
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function buildBookLoginRedirect(
  id: string,
  title: string,
  searchParams: Record<string, string | undefined>,
): string {
  const qs = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => typeof v === 'string') as [
      string,
      string,
    ][],
  ).toString();
  const callbackUrl = qs
    ? `/book/${id}/${title}?${qs}`
    : `/book/${id}/${title}`;
  return buildLoginRedirect(callbackUrl);
}
