import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
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
import { colors } from "../theme";
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
});
