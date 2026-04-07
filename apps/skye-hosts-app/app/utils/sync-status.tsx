import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { colors } from "../theme";

const STALE_THRESHOLD_HOURS = 6;
const EXPORT_WARNING_AGE_HOURS = 24;
const AUTO_DISABLE_THRESHOLD = 10;

export type SyncHealth = "healthy" | "stale" | "warning" | "error" | "unknown";

export function isAutoDisabled(sync: ICalendarSyncDto): boolean {
  return sync.consecutiveFailures >= AUTO_DISABLE_THRESHOLD;
}

function getImportHealth(sync: ICalendarSyncDto): SyncHealth {
  if (isAutoDisabled(sync)) return "error";
  if (sync.lastImportStatus === "error") return "error";
  // Never-run imports count as healthy: the first cron hasn't landed yet, the
  // host has nothing to act on, and we don't want the aggregate dot to go grey
  // for a brand-new sync whose export is also still in its grace period.
  if (!sync.lastImportAt) return "healthy";
  const hoursSinceSync =
    (Date.now() - new Date(sync.lastImportAt).getTime()) / 3_600_000;
  if (hoursSinceSync > STALE_THRESHOLD_HOURS) return "stale";
  return "healthy";
}

export function isExportPendingWarning(sync: ICalendarSyncDto): boolean {
  if (sync.lastExportedAt) return false;
  const hoursSinceCreated =
    (Date.now() - new Date(sync.createdAt).getTime()) / 3_600_000;
  return hoursSinceCreated > EXPORT_WARNING_AGE_HOURS;
}

function getExportHealth(sync: ICalendarSyncDto): SyncHealth {
  if (sync.lastExportedAt) return "healthy";
  // Pending (≤24h, never fetched) is a normal grace period — the host has
  // nothing to act on, so treat it as healthy. Only flag once the 24h window
  // has elapsed and the external platform still hasn't polled.
  return isExportPendingWarning(sync) ? "warning" : "healthy";
}

const severity: Record<SyncHealth, number> = {
  error: 4,
  warning: 3,
  stale: 2,
  unknown: 1,
  healthy: 0,
};

export function getSyncHealth(sync: ICalendarSyncDto): SyncHealth {
  const importHealth = getImportHealth(sync);
  const exportHealth = getExportHealth(sync);
  return severity[importHealth] >= severity[exportHealth]
    ? importHealth
    : exportHealth;
}

const healthColorMap: Record<SyncHealth, string> = {
  healthy: colors.success,
  stale: colors.warning,
  warning: colors.warning,
  error: colors.danger,
  unknown: colors.textSecondary,
};

export function getSyncHealthColor(sync: ICalendarSyncDto): string {
  return healthColorMap[getSyncHealth(sync)];
}

export function getAggregateSyncHealthColor(syncs: ICalendarSyncDto[]): string {
  if (syncs.length === 0) return colors.textSecondary;
  const worst = syncs
    .map(getSyncHealth)
    .reduce((a, b) => (severity[a] >= severity[b] ? a : b));
  return healthColorMap[worst];
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
