'use client';

import type { IGetListingResponseDto } from '@repo/skye-hosts-api-client';
import { ListingThingsToKnowSection } from '@repo/web-components/listings/listing-things-to-know-section';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

function parseDateParam(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

interface Props {
  listing: IGetListingResponseDto;
}

export function ListingThingsToKnowWithDates({ listing }: Props) {
  const searchParams = useSearchParams();
  const checkInDate = parseDateParam(searchParams.get('checkin'));

  const handleAddDates = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-date-picker'));
  }, []);

  return (
    <ListingThingsToKnowSection
      listing={listing}
      checkInDate={checkInDate}
      onAddDates={handleAddDates}
    />
  );
}
