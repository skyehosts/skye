import type {
  CalendarBlockSource,
  CalendarSyncPlatform,
  ICalendarBlockDto,
  IListingBookingItemDto,
  IMinNightsByCheckInDay,
} from "@repo/skye-hosts-api-client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import { commonStyles } from "../../theme/common-styles";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { isExternalBooking } from "../utils/booking-segments";
import { formatDateString, parseDateString } from "../utils/format-date-string";
import { computeRestrictedDates } from "../utils/min-nights-gap";
import type { DayCellStatus } from "./day-cell";
import { MonthGrid, type DayPriceInfo, type MonthData } from "./month-grid";

const MONTHS_IN_PAST = 6;
const MONTHS_IN_FUTURE = 18;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_GAP = 3;
const CELL_SIZE = (SCREEN_WIDTH - spacing.md * 2 - 6 * CELL_GAP) / 7;
const CELL_HEIGHT = 96;
const WEEKDAY_ROW_MARGIN_BOTTOM = 5;
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Expand a date range into individual YYYY-MM-DD strings */
function expandDateRange(
  startStr: string,
  endStr: string,
  inclusive: boolean,
): string[] {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  const cur = new Date(start.year, start.month, start.day);
  const endDate = new Date(end.year, end.month, end.day);
  const dates: string[] = [];
  while (inclusive ? cur <= endDate : cur < endDate) {
    dates.push(
      formatDateString(cur.getFullYear(), cur.getMonth(), cur.getDate()),
    );
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Height of the weekday header row (static) */
const WEEKDAY_ROW_HEIGHT = 18 + spacing.xs;
/** Height of the month label */
export const MONTH_LABEL_HEIGHT = 22 + spacing.md * 2;

function buildMonthData(year: number, month: number): MonthData {
  const date = new Date(year, month, 1);
  const label = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  const firstDayOfWeek = (date.getDay() + 6) % 7;

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(firstDayOfWeek).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return { key, label, year, month, weeks };
}

function generateMonths(): MonthData[] {
  const now = new Date();
  const months: MonthData[] = [];

  for (let i = -MONTHS_IN_PAST; i < MONTHS_IN_FUTURE; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(buildMonthData(date.getFullYear(), date.getMonth()));
  }

  return months;
}

function getMonthHeight(month: MonthData): number {
  const weekRows = month.weeks.length * CELL_HEIGHT;
  const rowGaps = (month.weeks.length - 1) * CELL_GAP;
  return MONTH_LABEL_HEIGHT + weekRows + rowGaps + spacing.lg;
}

/** Build a Set of all dates between two date strings (inclusive). */
function buildDateRange(a: string, b: string): Set<string> {
  const start = a < b ? a : b;
  const end = a < b ? b : a;
  return new Set(expandDateRange(start, end, true));
}

export interface BlockedDateInfo {
  source: CalendarBlockSource;
  platform: CalendarSyncPlatform | null;
  blockId: number;
}

interface CalendarListProps {
  bookings?: IListingBookingItemDto[];
  blocks?: ICalendarBlockDto[];
  platformBySyncId?: Map<number, CalendarSyncPlatform>;
  pricesByDate?: Map<string, DayPriceInfo>;
  minNights?: number;
  minNightsByCheckInDay?: IMinNightsByCheckInDay | null;
  getDayStatus?: (dateString: string) => DayCellStatus;
  onReloadData?: () => void;
  onSelectionComplete?: (startDate: string, endDate: string) => void;
}

export function CalendarList({
  bookings,
  blocks,
  platformBySyncId,
  pricesByDate,
  minNights: minNightsProp,
  minNightsByCheckInDay,
  getDayStatus: getDayStatusProp,
  onReloadData,
  onSelectionComplete,
}: CalendarListProps) {
  const months = useMemo(() => generateMonths(), []);
  const flatListRef = useRef<FlatList<MonthData>>(null);

  // Selection state
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const selectionActiveRef = useRef(false);

  // Layout tracking for coordinate → date mapping
  const containerTopRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  const selectedDates = useMemo(() => {
    if (!selectionAnchor || !selectionEnd) return new Set<string>();
    return buildDateRange(selectionAnchor, selectionEnd);
  }, [selectionAnchor, selectionEnd]);

  // `bookedDates`: cells rendered with "booked" status (unavailable).
  // `datesWithBookingBar`: cells with a bar painted over them — a superset
  // of bookedDates that also includes each external iCal block's endDate,
  // since the bar visually penetrates into that checkout cell even though
  // iCal DTEND is exclusive and the cell is still bookable.
  const { bookedDates, datesWithBookingBar } = useMemo(() => {
    const booked = new Set<string>();
    const withBar = new Set<string>();
    for (const booking of bookings ?? []) {
      for (const d of expandDateRange(
        booking.checkInDate,
        booking.checkOutDate,
        true,
      )) {
        booked.add(d);
        withBar.add(d);
      }
    }
    for (const block of blocks ?? []) {
      if (block.source !== "import" || !isExternalBooking(block.summary))
        continue;
      for (const d of expandDateRange(block.startDate, block.endDate, false)) {
        booked.add(d);
        withBar.add(d);
      }
      withBar.add(block.endDate);
    }
    return { bookedDates: booked, datesWithBookingBar: withBar };
  }, [bookings, blocks]);

  const blockedDateInfo = useMemo(() => {
    const map = new Map<string, BlockedDateInfo[]>();
    for (const block of blocks ?? []) {
      // Imported blocks that are actual bookings render as bars, not blocked cells
      if (block.source === "import" && isExternalBooking(block.summary))
        continue;
      const info: BlockedDateInfo = {
        source: block.source,
        platform:
          block.calendarSyncId !== null
            ? (platformBySyncId?.get(block.calendarSyncId) ?? null)
            : null,
        blockId: block.id,
      };
      // endDate is exclusive per iCal DTEND semantics
      for (const d of expandDateRange(block.startDate, block.endDate, false)) {
        if (bookedDates.has(d)) continue;
        const existing = map.get(d);
        if (existing) existing.push(info);
        else map.set(d, [info]);
      }
    }
    return map;
  }, [blocks, bookedDates, platformBySyncId]);

  const restrictedDates = useMemo(() => {
    const effectiveMin = minNightsProp ?? 1;
    const occupiedDates = new Set(bookedDates);
    for (const key of blockedDateInfo.keys()) {
      occupiedDates.add(key);
    }
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const rangeStart = formatDateString(firstMonth.year, firstMonth.month, 1);
    const lastDaysInMonth = new Date(
      lastMonth.year,
      lastMonth.month + 1,
      0,
    ).getDate();
    const rangeEnd = formatDateString(
      lastMonth.year,
      lastMonth.month,
      lastDaysInMonth,
    );
    return computeRestrictedDates(
      occupiedDates,
      effectiveMin,
      minNightsByCheckInDay ?? null,
      rangeStart,
      rangeEnd,
    );
  }, [
    bookedDates,
    blockedDateInfo,
    minNightsProp,
    minNightsByCheckInDay,
    months,
  ]);

  const todayString = useMemo(() => {
    const now = new Date();
    return formatDateString(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Pre-compute cumulative offsets for getItemLayout
  const itemLayouts = useMemo(() => {
    const layouts: { length: number; offset: number }[] = [];
    let offset = 0;
    for (const month of months) {
      const height = getMonthHeight(month);
      layouts.push({ length: height, offset });
      offset += height;
    }
    return layouts;
  }, [months]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      ...itemLayouts[index],
      index,
    }),
    [itemLayouts],
  );

  // Map page coordinates to a date string
  const dateFromCoordinates = useCallback(
    (pageX: number, pageY: number): string | null => {
      const dayIndex = Math.floor(
        (pageX - spacing.md) / (CELL_SIZE + CELL_GAP),
      );
      if (dayIndex < 0 || dayIndex > 6) return null;

      // Y position within the scrollable content
      const contentY =
        pageY -
        containerTopRef.current -
        WEEKDAY_ROW_HEIGHT -
        WEEKDAY_ROW_MARGIN_BOTTOM +
        scrollOffsetRef.current;

      if (contentY < 0) return null;

      // Find which month
      let monthIndex = -1;
      for (let i = 0; i < itemLayouts.length; i++) {
        const layout = itemLayouts[i];
        if (contentY < layout.offset + layout.length) {
          monthIndex = i;
          break;
        }
      }
      if (monthIndex < 0) return null;

      const month = months[monthIndex];
      const layout = itemLayouts[monthIndex];
      const yInMonth = contentY - layout.offset;

      // Subtract month label height
      const yInGrid = yInMonth - MONTH_LABEL_HEIGHT;
      if (yInGrid < 0) return null;

      const weekIndex = Math.floor(yInGrid / (CELL_HEIGHT + CELL_GAP));
      if (weekIndex < 0 || weekIndex >= month.weeks.length) return null;

      const day = month.weeks[weekIndex][dayIndex];
      if (day === null) return null;

      return formatDateString(month.year, month.month, day);
    },
    [itemLayouts, months],
  );

  // Selection handlers
  const handleLongPress = useCallback(
    (dateString: string) => {
      if (dateString < todayString) return; // Can't select past dates
      selectionActiveRef.current = true;
      setSelectionAnchor(dateString);
      setSelectionEnd(dateString);
      setScrollEnabled(false);
    },
    [todayString],
  );

  const handleDayTap = useCallback(
    (dateString: string) => {
      if (dateString < todayString) return;
      if (bookedDates.has(dateString)) return;
      const parsed = parseDateString(dateString);
      const next = new Date(parsed.year, parsed.month, parsed.day + 1);
      const exclusiveEnd = formatDateString(
        next.getFullYear(),
        next.getMonth(),
        next.getDate(),
      );
      onSelectionComplete?.(dateString, exclusiveEnd);
    },
    [todayString, bookedDates, onSelectionComplete],
  );

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!selectionActiveRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const date = dateFromCoordinates(pageX, pageY);
      if (date && date >= todayString) {
        setSelectionEnd(date);
      }
    },
    [dateFromCoordinates, todayString],
  );

  const handleTouchEnd = useCallback(() => {
    if (!selectionActiveRef.current) return;
    selectionActiveRef.current = false;
    setScrollEnabled(true);

    const anchor = selectionAnchor;
    const end = selectionEnd;
    if (anchor && end) {
      const start = anchor < end ? anchor : end;
      const endDate = anchor < end ? end : anchor;
      // Add one day to endDate for exclusive end (iCal DTEND semantics)
      const parsed = parseDateString(endDate);
      const d = new Date(parsed.year, parsed.month, parsed.day + 1);
      const exclusiveEnd = formatDateString(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      );
      console.log("[CalendarList] handleTouchEnd → onSelectionComplete", {
        start,
        exclusiveEnd,
      });
      onSelectionComplete?.(start, exclusiveEnd);
    } else {
      console.log("[CalendarList] handleTouchEnd → no anchor/end", {
        anchor,
        end,
      });
    }

    setSelectionAnchor(null);
    setSelectionEnd(null);
  }, [selectionAnchor, selectionEnd, onSelectionComplete]);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    e.target.measureInWindow((_x: number, y: number) => {
      containerTopRef.current = y;
    });
  }, []);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  // getDayStatus that overlays selection on top of normal status.
  // Returns undefined when no opinion so MonthGrid's own cascade
  // (booked → blocked → restricted → none) still runs.
  const getDayStatus = useCallback(
    (dateString: string): DayCellStatus | undefined => {
      if (selectedDates.has(dateString)) return "selected";
      if (getDayStatusProp) return getDayStatusProp(dateString);
      return undefined;
    },
    [selectedDates, getDayStatusProp],
  );

  const renderMonth = useCallback(
    ({ item }: { item: MonthData }) => (
      <MonthGrid
        data={item}
        cellSize={CELL_SIZE}
        cellHeight={CELL_HEIGHT}
        cellGap={CELL_GAP}
        todayString={todayString}
        bookings={bookings}
        blocks={blocks}
        platformBySyncId={platformBySyncId}
        bookedDates={bookedDates}
        blockedDateInfo={blockedDateInfo}
        restrictedDates={restrictedDates}
        datesWithBookingBar={datesWithBookingBar}
        pricesByDate={pricesByDate}
        minNights={minNightsProp ?? 1}
        onDayPress={handleDayTap}
        getDayStatus={getDayStatus}
        onReloadData={onReloadData}
        onLongPress={handleLongPress}
      />
    ),
    [
      todayString,
      bookings,
      blocks,
      platformBySyncId,
      bookedDates,
      blockedDateInfo,
      restrictedDates,
      datesWithBookingBar,
      pricesByDate,
      minNightsProp,
      handleDayTap,
      getDayStatus,
      onReloadData,
      handleLongPress,
    ],
  );

  const keyExtractor = useCallback((item: MonthData) => item.key, []);

  return (
    <View
      style={commonStyles.flex}
      onLayout={handleContainerLayout}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <View
        style={[
          styles.weekdayRow,
          { paddingHorizontal: spacing.md, gap: CELL_GAP },
        ]}
      >
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekdayCell, { width: CELL_SIZE }]}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        ref={flatListRef}
        data={months}
        extraData={{ bookings, blocks, selectedDates }}
        renderItem={renderMonth}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={MONTHS_IN_PAST}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        maxToRenderPerBatch={3}
        removeClippedSubviews={scrollEnabled}
        scrollEnabled={scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: "row",
    marginBottom: WEEKDAY_ROW_MARGIN_BOTTOM,
  },
  weekdayCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
  },
});
