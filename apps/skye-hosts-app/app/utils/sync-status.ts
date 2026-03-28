import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { colors } from "../theme";

const STALE_THRESHOLD_HOURS = 6;
const AUTO_DISABLE_THRESHOLD = 10;

export type SyncHealth = "healthy" | "stale" | "error" | "unknown";

export function getSyncHealth(sync: ICalendarSyncDto): SyncHealth {
  if (!sync.isImportEnabled && sync.importUrl) return "error";
  if (sync.lastImportStatus === "error") return "error";
  if (!sync.lastImportAt) return "unknown";
  const hoursSinceSync =
    (Date.now() - new Date(sync.lastImportAt).getTime()) / 3_600_000;
  if (hoursSinceSync > STALE_THRESHOLD_HOURS) return "stale";
  return "healthy";
}

export function isAutoDisabled(sync: ICalendarSyncDto): boolean {
  return (
    !sync.isImportEnabled &&
    !!sync.importUrl &&
    sync.consecutiveFailures >= AUTO_DISABLE_THRESHOLD
  );
}

const healthColorMap: Record<SyncHealth, string> = {
  healthy: colors.success,
  stale: colors.warning,
  error: colors.danger,
  unknown: colors.textSecondary,
};

export function getSyncHealthColor(sync: ICalendarSyncDto): string {
  return healthColorMap[getSyncHealth(sync)];
}

export function getAggregateSyncColor(
  syncs: ICalendarSyncDto[],
): string | null {
  if (syncs.length === 0) return null;
  if (syncs.some((s) => getSyncHealth(s) === "error")) return colors.danger;
  if (syncs.some((s) => getSyncHealth(s) === "stale")) return colors.warning;
  return colors.success;
}
