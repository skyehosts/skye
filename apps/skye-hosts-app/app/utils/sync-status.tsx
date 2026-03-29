import type {
  CalendarSyncPlatform,
  ICalendarSyncDto,
} from "@repo/skye-hosts-api-client";
import { View } from "react-native";
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

export const PLATFORM_LABELS: Record<CalendarSyncPlatform, string> = {
  airbnb: "AirBnB",
  booking_com: "Booking.com",
  other: "Other",
};

export type SyncDirectionStatus = "two-way" | "one-way" | "none";

export function getSyncDirection(
  sync: ICalendarSyncDto,
): "two-way" | "one-way" | "none" {
  const hasImport = !!sync.importUrl && sync.isImportEnabled;
  const hasExport = sync.isExportEnabled;
  if (hasImport && hasExport) return "two-way";
  if (hasImport || hasExport) return "one-way";
  return "none";
}

export function getAggregateSyncDirection(
  syncs: ICalendarSyncDto[],
): SyncDirectionStatus {
  if (syncs.length === 0) return "none";
  const directions = syncs.map(getSyncDirection);
  if (directions.every((d) => d === "none")) return "none";
  if (
    directions.some((d) => d === "one-way") ||
    directions.some((d) => d === "none")
  )
    return "one-way";
  return "two-way";
}

export function getSyncDirectionColor(status: SyncDirectionStatus): string {
  switch (status) {
    case "two-way":
      return colors.success;
    case "one-way":
      return colors.warning;
    case "none":
      return colors.danger;
  }
}

export function SyncDirectionBadge({
  direction,
  size,
}: {
  direction: SyncDirectionStatus;
  size: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: getSyncDirectionColor(direction),
      }}
    />
  );
}
