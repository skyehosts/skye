import type {
  CalendarSyncImportStatus,
  CalendarSyncPlatform,
} from '../../enums/calendar-sync-enums';

export interface ICalendarSyncDto {
  id: number;
  listingId: number;
  platform: CalendarSyncPlatform;
  label: string | null;
  importUrl: string | null;
  exportUrl: string;
  lastImportAt: string | null;
  lastImportStatus: CalendarSyncImportStatus | null;
  lastImportError: string | null;
  lastImportEventCount: number | null;
  consecutiveFailures: number;
  isImportEnabled: boolean;
  isExportEnabled: boolean;
  createdAt: string;
}
