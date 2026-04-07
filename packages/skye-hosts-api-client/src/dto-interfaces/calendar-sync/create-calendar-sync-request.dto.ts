import type { CalendarSyncPlatform } from '../../enums/calendar-sync-enums';

export interface ICreateCalendarSyncRequestDto {
  platform: CalendarSyncPlatform;
  label?: string;
  importUrl: string;
}
