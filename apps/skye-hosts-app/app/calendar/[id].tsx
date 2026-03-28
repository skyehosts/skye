import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Appbar, Icon, Text } from "react-native-paper";
import type {
  ICalendarBlockDto,
  ICalendarSyncDto,
  IGetCalendarBlocksResponseDto,
  IGetCalendarSyncsResponseDto,
  IGetListingBookingsResponseDto,
  IListingBookingItemDto,
} from "@repo/skye-hosts-api-client";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, spacing, typography } from "../theme";
import { borderRadius } from "../theme/border-radius";
import { getAggregateSyncColor } from "../utils/sync-status";
import { CalendarList } from "./components/calendar-list";

export default function CalendarDetailScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [bookings, setBookings] = useState<IListingBookingItemDto[]>([]);
  const [blocks, setBlocks] = useState<ICalendarBlockDto[]>([]);
  const [syncs, setSyncs] = useState<ICalendarSyncDto[]>([]);

  const loadData = useCallback(async () => {
    const [bookingsResult, blocksResult, syncsResult] =
      await Promise.allSettled([
        fetchApi<IGetListingBookingsResponseDto>(
          `/booking/listing/${id}`,
          undefined,
          { method: "GET" },
        ),
        fetchApi<IGetCalendarBlocksResponseDto>(
          `/calendar-sync/listing/${id}/blocks`,
          undefined,
          { method: "GET" },
        ),
        fetchApi<IGetCalendarSyncsResponseDto>(
          `/calendar-sync/listing/${id}`,
          undefined,
          { method: "GET" },
        ),
      ]);

    if (bookingsResult.status === "fulfilled") {
      setBookings(bookingsResult.value.bookings);
    }
    if (blocksResult.status === "fulfilled") {
      setBlocks(blocksResult.value.blocks);
    }
    if (syncsResult.status === "fulfilled") {
      setSyncs(syncsResult.value.syncs);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncStatusColor = getAggregateSyncColor(syncs);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title ?? "Calendar"} />
        <View>
          <Appbar.Action
            icon="sync"
            onPress={() =>
              router.push({
                pathname: "/edit-listing/calendar-sync",
                params: { id },
              })
            }
          />
          {syncStatusColor && (
            <View
              style={[styles.statusBadge, { backgroundColor: syncStatusColor }]}
            />
          )}
        </View>
      </Appbar.Header>
      {syncs.length === 0 && (
        <Pressable
          style={styles.syncBanner}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/calendar-sync",
              params: { id },
            })
          }
        >
          <Icon source="sync-alert" size={20} color={colors.primary} />
          <View style={styles.syncBannerText}>
            <Text style={styles.syncBannerTitle}>
              List on multiple platforms?
            </Text>
            <Text style={styles.syncBannerSubtext}>
              Sync your calendars to avoid double bookings
            </Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSecondary} />
        </Pressable>
      )}
      <CalendarList bookings={bookings} blocks={blocks} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
  },
  syncBannerText: {
    flex: 1,
  },
  syncBannerTitle: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  syncBannerSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
