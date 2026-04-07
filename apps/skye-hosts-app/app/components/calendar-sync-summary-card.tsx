import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarSyncColumns } from "./calendar-sync-columns";
import { SyncHealthDot } from "./sync-health-dot";
import { commonStyles, spacing } from "../theme";
import { getSyncHealthColor } from "../utils/sync-status";
import { getPlatformLabel } from "../utils/calendar-sync-constants";

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
        syncs.map((sync) => (
          <View key={sync.id} style={styles.syncBlock}>
            <View style={styles.syncConnectedRow}>
              <SyncHealthDot color={getSyncHealthColor(sync)} />
              <Text style={commonStyles.itemSubtext}>
                {getPlatformLabel(sync.platform)} connected
              </Text>
            </View>

            <CalendarSyncColumns
              sync={sync}
              onTriggerImport={onTriggerImport}
              syncingId={syncingId}
            />
          </View>
        ))
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  syncBlock: {
    gap: spacing.sm,
  },
  syncConnectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
