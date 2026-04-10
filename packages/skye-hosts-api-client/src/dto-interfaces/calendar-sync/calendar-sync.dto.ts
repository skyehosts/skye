import type {
  CalendarSyncImportStatus,
  CalendarSyncPlatform,
} from '../../enums/calendar-sync-enums';

export interface ICalendarSyncDto {
  id: number;
  listingId: number;
  platform: CalendarSyncPlatform;
  label: string | null;
  importUrl: string;
  exportUrl: string;
  lastExportedAt: string | null;
  lastImportAt: string | null;
  lastImportStatus: CalendarSyncImportStatus | null;
  lastImportError: string | null;
  lastImportEventCount: number | null;
  consecutiveFailures: number;
  createdAt: string;
}
