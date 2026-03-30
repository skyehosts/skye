import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import type {
  CalendarSyncPlatform,
  ICalendarBlockDto,
  ICalendarSyncDto,
  IGetCalendarBlocksResponseDto,
  IGetCalendarSyncsResponseDto,
  IGetListingBookingsResponseDto,
  IGetListingResponseDto,
  IListingBookingItemDto,
  IMinNightsByCheckInDay,
} from "@repo/skye-hosts-api-client";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  SyncDirectionBadge,
  getAggregateSyncDirection,
} from "../utils/sync-status";
import { CalendarList } from "./components/calendar-list";

export default function CalendarDetailScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [bookings, setBookings] = useState<IListingBookingItemDto[]>([]);
  const [blocks, setBlocks] = useState<ICalendarBlockDto[]>([]);
  const [syncs, setSyncs] = useState<ICalendarSyncDto[]>([]);
  const [minNights, setMinNights] = useState(1);
  const [minNightsByCheckInDay, setMinNightsByCheckInDay] =
    useState<IMinNightsByCheckInDay | null>(null);

  const loadData = useCallback(async () => {
    const [bookingsResult, blocksResult, syncsResult, listingResult] =
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
        fetchApi<IGetListingResponseDto>(`/listing/${id}`, undefined, {
          method: "GET",
        }),
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
    if (listingResult.status === "fulfilled") {
      setMinNights(listingResult.value.minNights);
      setMinNightsByCheckInDay(listingResult.value.minNightsByCheckInDay);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncDirection = getAggregateSyncDirection(syncs);

  const platformBySyncId = useMemo(() => {
    const map = new Map<number, CalendarSyncPlatform>();
    for (const sync of syncs) {
      map.set(sync.id, sync.platform);
    }
    return map;
  }, [syncs]);

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
          <View style={styles.statusBadge}>
            <SyncDirectionBadge direction={syncDirection} size={10} />
          </View>
        </View>
      </Appbar.Header>
      <CalendarList
        bookings={bookings}
        blocks={blocks}
        platformBySyncId={platformBySyncId}
        minNights={minNights}
        minNightsByCheckInDay={minNightsByCheckInDay}
        onReloadData={loadData}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
