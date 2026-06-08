import {
  toDateString,
  type ICalendarPricesResponseDto,
  type IGetOverridesResponseDto,
} from "@repo/common";
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
import { SyncHealthDot } from "../components/sync-health-dot";
import { captureException } from "../services/error-reporting";
import { fetchApi } from "../services/api";
import { getAggregateSyncHealthColor } from "../utils/sync-status";
import { CalendarList } from "./components/calendar-list";
import { DateBlockSheet } from "./components/date-block-sheet";
import { HelpTooltipButton } from "./components/help-tooltip-button";
import type { DayPriceInfo } from "./components/month-grid";
import { PriceOverrideModal } from "./components/price-override-modal";

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
  const [pricesByDate, setPricesByDate] = useState<Map<string, DayPriceInfo>>(
    new Map(),
  );
  const [overrideDates, setOverrideDates] = useState<Set<string>>(new Set());
  const [priceOverrideModalVisible, setPriceOverrideModalVisible] =
    useState(false);

  const loadData = useCallback(async () => {
    const today = new Date();
    const from = toDateString(today);
    const rangeEnd = new Date(today);
    rangeEnd.setFullYear(rangeEnd.getFullYear() + 1);
    rangeEnd.setMonth(rangeEnd.getMonth() + 6);
    const to = toDateString(rangeEnd);

    const [
      bookingsResult,
      blocksResult,
      syncsResult,
      listingResult,
      pricesResult,
      overridesResult,
    ] = await Promise.allSettled([
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
      fetchApi<ICalendarPricesResponseDto>(
        `/listing/${id}/calendar-prices?from=${from}&to=${to}`,
        undefined,
        { method: "GET" },
      ),
      fetchApi<IGetOverridesResponseDto>(
        `/listing/${id}/overrides?from=${from}&to=${to}`,
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
    if (listingResult.status === "fulfilled") {
      setMinNights(listingResult.value.minNights);
      setMinNightsByCheckInDay(listingResult.value.minNightsByCheckInDay);
    }
    if (pricesResult.status === "fulfilled") {
      const map = new Map<string, DayPriceInfo>();
      for (const p of pricesResult.value.prices) {
        map.set(p.date, {
          hostNetPence: p.hostNetPence,
          isOverride: p.isOverride,
        });
      }
      setPricesByDate(map);
    }
    if (overridesResult.status === "fulfilled") {
      setOverrideDates(
        new Set(overridesResult.value.overrides.map((o) => o.date)),
      );
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const syncHealthColor = getAggregateSyncHealthColor(syncs);

  const platformBySyncId = useMemo(() => {
    const map = new Map<number, CalendarSyncPlatform>();
    for (const sync of syncs) {
      map.set(sync.id, sync.platform);
    }
    return map;
  }, [syncs]);

  // Check if the selected range has manual blocks, bookings, or unblocked dates
  const { hasManualBlocks, hasUnblockedDates, hasBookedDates } = useMemo(() => {
    if (!sheetStartDate || !sheetEndDate)
      return {
        hasManualBlocks: false,
        hasUnblockedDates: false,
        hasBookedDates: false,
      };

    let foundManualBlock = false;
    let foundUnblocked = false;
    let foundBooking = false;

    // Build a set of all occupied dates (blocks + bookings) in the selection range
    const occupiedDatesInRange = new Set<string>();

    /** Clamp an overlapping range to the sheet window and add dates to a set */
    const addOverlap = (start: string, end: string) => {
      const clamped0 = start > sheetStartDate ? start : sheetStartDate;
      const clamped1 = end < sheetEndDate ? end : sheetEndDate;
      const cur = new Date(clamped0 + "T00:00:00");
      const stop = new Date(clamped1 + "T00:00:00");
      while (cur < stop) {
        occupiedDatesInRange.add(toDateString(cur));
        cur.setDate(cur.getDate() + 1);
      }
    };

    for (const block of blocks) {
      if (block.startDate < sheetEndDate && block.endDate > sheetStartDate) {
        if (block.source === "manual") foundManualBlock = true;
        addOverlap(block.startDate, block.endDate);
      }
    }

    // Check-out day is excluded (same-day check-in/check-out allowed)
    for (const booking of bookings) {
      if (
        booking.checkInDate < sheetEndDate &&
        booking.checkOutDate > sheetStartDate
      ) {
        foundBooking = true;
        addOverlap(booking.checkInDate, booking.checkOutDate);
      }
    }

    // Check if any date in range is free (not blocked and not booked)
    const rangeStart = new Date(sheetStartDate + "T00:00:00");
    const rangeEnd = new Date(sheetEndDate + "T00:00:00");
    const cur = new Date(rangeStart);
    while (cur < rangeEnd) {
      const ds = toDateString(cur);
      if (!occupiedDatesInRange.has(ds)) {
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
      foundBooking,
      blocksCount: blocks.length,
      bookingsCount: bookings.length,
      occupiedDatesInRangeCount: occupiedDatesInRange.size,
    });

    return {
      hasManualBlocks: foundManualBlock,
      hasUnblockedDates: foundUnblocked,
      hasBookedDates: foundBooking,
    };
  }, [blocks, bookings, sheetStartDate, sheetEndDate]);

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

  const handleOpenPriceOverride = useCallback(() => {
    setSheetVisible(false);
    setPriceOverrideModalVisible(true);
  }, []);

  const existingOverrideDatesInRange = useMemo(() => {
    if (!sheetStartDate || !sheetEndDate) return [];
    const out: string[] = [];
    for (const d of overrideDates) {
      if (d >= sheetStartDate && d < sheetEndDate) out.push(d);
    }
    return out;
  }, [overrideDates, sheetStartDate, sheetEndDate]);

  const handleOverrideSaved = useCallback(async () => {
    setPriceOverrideModalVisible(false);
    await loadData();
  }, [loadData]);

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
          <SyncHealthDot color={syncHealthColor} style={styles.statusBadge} />
        </View>
      </Appbar.Header>
      <CalendarList
        bookings={bookings}
        blocks={blocks}
        platformBySyncId={platformBySyncId}
        pricesByDate={pricesByDate}
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
        hasBookedDates={hasBookedDates}
        loading={sheetLoading}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onSetPriceOverride={handleOpenPriceOverride}
        onDismiss={handleSheetDismiss}
      />
      {priceOverrideModalVisible && sheetStartDate && sheetEndDate && (
        <PriceOverrideModal
          visible={true}
          listingId={id as string}
          startDate={sheetStartDate}
          endDate={sheetEndDate}
          existingOverrideDates={existingOverrideDatesInRange}
          onDismiss={() => setPriceOverrideModalVisible(false)}
          onSaved={handleOverrideSaved}
        />
      )}
      {!sheetVisible && !priceOverrideModalVisible && <HelpTooltipButton />}
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
