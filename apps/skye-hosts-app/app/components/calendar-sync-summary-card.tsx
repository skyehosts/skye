import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Icon, Portal } from "react-native-paper";
import { InfoBox } from "./info-box";
import { colors, commonStyles, spacing, typography } from "../theme";
import {
  PLATFORM_LABELS,
  getAggregateSyncDirection,
  getSyncHealthColor,
  isAutoDisabled,
} from "../utils/sync-status";
import { clampTooltipLeft } from "../utils/tooltip";
import { tooltipStyles } from "../calendar/components/tooltip-styles";

function formatRelativeTime(dateStr: string | null): string {
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

interface CalendarSyncSummaryCardProps {
  syncs: ICalendarSyncDto[];
  onPress: () => void;
  onTriggerImport?: (syncId: number) => void;
  syncingId?: number | null;
}

export function CalendarSyncSummaryCard({
  syncs,
  onPress,
  onTriggerImport,
  syncingId,
}: CalendarSyncSummaryCardProps) {
  const [infoTooltip, setInfoTooltip] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const infoIconRef = useRef<View>(null);

  const showInfoTooltip = useCallback(() => {
    infoIconRef.current?.measureInWindow((x, y, _w, h) => {
      setInfoTooltip({ x, y: y + h + 4 });
    });
  }, []);

  return (
    <Pressable
      style={[commonStyles.card, { gap: spacing.sm }]}
      onPress={onPress}
    >
      <Text style={commonStyles.itemTitle}>Calendar sync</Text>
      {syncs.length === 0 ? (
        <Text style={commonStyles.itemSubtext}>
          Sync with AirBnB or Booking.com to avoid double bookings
        </Text>
      ) : (
        <>
          {syncs.map((sync) => (
            <View key={sync.id} style={styles.syncBlock}>
              <View style={styles.syncConnectedRow}>
                <View
                  style={[
                    styles.syncDot,
                    { backgroundColor: getSyncHealthColor(sync) },
                  ]}
                />
                <Text style={commonStyles.itemSubtext}>
                  {PLATFORM_LABELS[sync.platform] ?? sync.platform} connected
                </Text>
              </View>

              <View style={styles.syncDetails}>
                {sync.importUrl && (
                  <Text style={commonStyles.itemSubtext}>
                    Import: {sync.isImportEnabled ? "On" : "Paused"}
                    {sync.lastImportAt &&
                      ` — Last synced ${formatRelativeTime(sync.lastImportAt)}`}
                  </Text>
                )}
                <Text style={commonStyles.itemSubtext}>
                  Export: {sync.isExportEnabled ? "On" : "Off"}
                </Text>
              </View>

              {sync.lastImportStatus === "error" && sync.lastImportError && (
                <Text style={styles.errorText} numberOfLines={2}>
                  Error: {sync.lastImportError}
                </Text>
              )}

              {isAutoDisabled(sync) && (
                <Text style={styles.disabledText}>
                  Import paused after repeated failures. Edit to update URL and
                  re-enable.
                </Text>
              )}

              {onTriggerImport && sync.importUrl && sync.isImportEnabled && (
                <View style={styles.syncActions}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => onTriggerImport(sync.id)}
                    loading={syncingId === sync.id}
                    disabled={syncingId === sync.id}
                    icon="download"
                  >
                    Import now
                  </Button>
                  <Pressable onPress={showInfoTooltip}>
                    <View ref={infoIconRef}>
                      <Icon
                        source="information-outline"
                        size={20}
                        color={colors.icon}
                      />
                    </View>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
          {getAggregateSyncDirection(syncs) === "one-way" && (
            <InfoBox variant="warning">
              Enable import and export for full protection
            </InfoBox>
          )}
        </>
      )}

      {infoTooltip && (
        <Portal>
          <Pressable
            style={tooltipStyles.backdrop}
            onPress={() => setInfoTooltip(null)}
          >
            <View
              style={[
                tooltipStyles.tooltip,
                {
                  left: clampTooltipLeft(infoTooltip.x),
                  top: infoTooltip.y,
                },
              ]}
            >
              <Text style={tooltipStyles.text}>
                Pulls the latest calendar from the connected platform. Export
                updates happen automatically and cannot be triggered manually.
              </Text>
            </View>
          </Pressable>
        </Portal>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  syncBlock: {
    gap: spacing.xs,
  },
  syncConnectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  syncDetails: {
    gap: spacing.xs,
    paddingLeft: spacing.lg,
  },
  syncActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.lg,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.danger,
    paddingLeft: spacing.lg,
  },
  disabledText: {
    fontSize: typography.sm,
    color: colors.warning,
    paddingLeft: spacing.lg,
  },
});
