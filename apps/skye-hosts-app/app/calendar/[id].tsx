import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import type {
  CalendarSyncPlatform,
  ICalendarBlockDto,
  ICalendarBlockResponseDto,
  ICalendarSyncDto,
  IGetCalendarBlocksResponseDto,
  IGetCalendarSyncsResponseDto,
  IGetListingBookingsResponseDto,
  IGetListingResponseDto,
  IListingBookingItemDto,
  IMinNightsByCheckInDay,
  ICreateCalendarBlockRequestDto,
  IUnblockRangeRequestDto,
  IUnblockRangeResponseDto,
} from "@repo/skye-hosts-api-client";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { captureException } from "../services/error-reporting";
import { fetchApi } from "../services/api";
import {
  SyncDirectionBadge,
  getAggregateSyncDirection,
} from "../utils/sync-status";
import { CalendarList } from "./components/calendar-list";
import { DateBlockSheet } from "./components/date-block-sheet";

export default function CalendarDetailScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [bookings, setBookings] = useState<IListingBookingItemDto[]>([]);
  const [blocks, setBlocks] = useState<ICalendarBlockDto[]>([]);
  const [syncs, setSyncs] = useState<ICalendarSyncDto[]>([]);
  const [minNights, setMinNights] = useState(1);
  const [minNightsByCheckInDay, setMinNightsByCheckInDay] =
    useState<IMinNightsByCheckInDay | null>(null);

  // Block sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetStartDate, setSheetStartDate] = useState("");
  const [sheetEndDate, setSheetEndDate] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const syncDirection = getAggregateSyncDirection(syncs);

  const platformBySyncId = useMemo(() => {
    const map = new Map<number, CalendarSyncPlatform>();
    for (const sync of syncs) {
      map.set(sync.id, sync.platform);
    }
    return map;
  }, [syncs]);

  // Check if the selected range has manual blocks or unblocked dates
  const { hasManualBlocks, hasUnblockedDates } = useMemo(() => {
    if (!sheetStartDate || !sheetEndDate)
      return { hasManualBlocks: false, hasUnblockedDates: false };

    let foundManualBlock = false;
    let foundUnblocked = false;

    // Build a set of all blocked dates (any source) in the selection range
    const blockedDatesInRange = new Set<string>();

    for (const block of blocks) {
      // Check if block overlaps with selection
      if (block.startDate < sheetEndDate && block.endDate > sheetStartDate) {
        if (block.source === "manual") foundManualBlock = true;

        // Expand the overlapping portion
        const overlapStart =
          block.startDate > sheetStartDate ? block.startDate : sheetStartDate;
        const overlapEnd =
          block.endDate < sheetEndDate ? block.endDate : sheetEndDate;

        const cur = new Date(overlapStart + "T00:00:00");
        const end = new Date(overlapEnd + "T00:00:00");
        while (cur < end) {
          blockedDatesInRange.add(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    // Check if any date in range is unblocked
    const rangeStart = new Date(sheetStartDate + "T00:00:00");
    const rangeEnd = new Date(sheetEndDate + "T00:00:00");
    const cur = new Date(rangeStart);
    while (cur < rangeEnd) {
      const ds = cur.toISOString().slice(0, 10);
      if (!blockedDatesInRange.has(ds)) {
        foundUnblocked = true;
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    console.log("[CalendarDetail] sheet state computed", {
      sheetStartDate,
      sheetEndDate,
      foundManualBlock,
      foundUnblocked,
      blocksCount: blocks.length,
      blockedDatesInRangeCount: blockedDatesInRange.size,
    });

    return {
      hasManualBlocks: foundManualBlock,
      hasUnblockedDates: foundUnblocked,
    };
  }, [blocks, sheetStartDate, sheetEndDate]);

  const handleSelectionComplete = useCallback(
    (startDate: string, endDate: string) => {
      console.log("[CalendarDetail] handleSelectionComplete", {
        startDate,
        endDate,
      });
      setSheetStartDate(startDate);
      setSheetEndDate(endDate);
      setSheetVisible(true);
    },
    [],
  );

  const handleBlock = useCallback(async () => {
    console.log("[CalendarDetail] handleBlock called", {
      id,
      sheetStartDate,
      sheetEndDate,
    });
    setSheetLoading(true);
    try {
      const result = await fetchApi<
        ICalendarBlockResponseDto,
        ICreateCalendarBlockRequestDto
      >(`/calendar-sync/listing/${id}/blocks`, {
        startDate: sheetStartDate,
        endDate: sheetEndDate,
      });
      console.log("[CalendarDetail] handleBlock success", result);
      setSheetVisible(false);
      await loadData();
    } catch (e) {
      console.log("[CalendarDetail] handleBlock error", e);
      captureException(e);
      setServerError("Failed to block dates. Please try again.");
    } finally {
      setSheetLoading(false);
    }
  }, [id, sheetStartDate, sheetEndDate, loadData]);

  const handleUnblock = useCallback(async () => {
    setSheetLoading(true);
    try {
      await fetchApi<IUnblockRangeResponseDto, IUnblockRangeRequestDto>(
        `/calendar-sync/listing/${id}/blocks/unblock-range`,
        { startDate: sheetStartDate, endDate: sheetEndDate },
      );
      setSheetVisible(false);
      await loadData();
    } catch (e) {
      captureException(e);
      setServerError("Failed to unblock dates. Please try again.");
    } finally {
      setSheetLoading(false);
    }
  }, [id, sheetStartDate, sheetEndDate, loadData]);

  const handleSheetDismiss = useCallback(() => {
    if (!sheetLoading) {
      setSheetVisible(false);
    }
  }, [sheetLoading]);

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
        onSelectionComplete={handleSelectionComplete}
      />
      <DateBlockSheet
        visible={sheetVisible}
        startDate={sheetStartDate}
        endDate={sheetEndDate}
        hasManualBlocks={hasManualBlocks}
        hasUnblockedDates={hasUnblockedDates}
        loading={sheetLoading}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onDismiss={handleSheetDismiss}
      />
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
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
