import type { CalendarBlockSource } from '../../enums/calendar-sync-enums';

export interface ICalendarBlockDto {
  id: number;
  listingId: number;
  calendarSyncId: number | null;
  source: CalendarBlockSource;
  startDate: string;
  endDate: string;
  summary: string | null;
}
