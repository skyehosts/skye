'use client';

import {
  fetchApi,
  type IGetListingUnavailabilityResponseDto,
} from '@repo/skye-hosts-api-client';
import { addDays, format } from 'date-fns';
import { useEffect, useState } from 'react';

function expandRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  // endDate is exclusive
  while (current < end) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }
  return dates;
}

export function useListingUnavailability(listingId: number): {
  unavailableDates: Set<string>;
  loading: boolean;
} {
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchApi<IGetListingUnavailabilityResponseDto>(
          `/listing/${listingId}/unavailability`,
        );
        if (cancelled) return;
        const dates = new Set<string>();
        for (const range of data.unavailableDates) {
          for (const d of expandRange(range.startDate, range.endDate)) {
            dates.add(d);
          }
        }
        setUnavailableDates(dates);
      } catch {
        // Fail silently — dates will remain selectable
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  return { unavailableDates, loading };
}
