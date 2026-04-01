export interface IUpdateCalendarSyncRequestDto {
  label?: string;
  importUrl?: string | null;
  isImportEnabled?: boolean;
  isExportEnabled?: boolean;
}
