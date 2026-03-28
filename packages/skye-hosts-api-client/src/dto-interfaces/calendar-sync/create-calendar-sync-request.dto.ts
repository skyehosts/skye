import type { CalendarSyncPlatform } from '../../enums/calendar-sync-enums';

export interface ICreateCalendarSyncRequestDto {
  platform: CalendarSyncPlatform;
  importUrl?: string;
  isImportEnabled?: boolean;
  isExportEnabled?: boolean;
}
