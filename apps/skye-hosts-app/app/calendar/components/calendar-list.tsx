import type {
  CalendarBlockSource,
  CalendarSyncPlatform,
  ICalendarBlockDto,
  IListingBookingItemDto,
} from "@repo/skye-hosts-api-client";
import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "../../theme/common-styles";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { isExternalBooking } from "../utils/booking-segments";
import { formatDateString, parseDateString } from "../utils/format-date-string";
import type { DayCellStatus } from "./day-cell";
import { MonthGrid, type MonthData } from "./month-grid";

const MONTHS_IN_PAST = 6;
const MONTHS_IN_FUTURE = 18;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_GAP = 3;
const CELL_SIZE = (SCREEN_WIDTH - spacing.md * 2 - 6 * CELL_GAP) / 7;
const CELL_HEIGHT = 96;
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

export interface BlockedDateInfo {
  source: CalendarBlockSource;
  platform: CalendarSyncPlatform | null;
  blockId: number;
}

interface CalendarListProps {
  bookings?: IListingBookingItemDto[];
  blocks?: ICalendarBlockDto[];
  platformBySyncId?: Map<number, CalendarSyncPlatform>;
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus;
  onReloadData?: () => void;
}

export function CalendarList({
  bookings,
  blocks,
  platformBySyncId,
  onDayPress,
  getDayStatus: getDayStatusProp,
  onReloadData,
}: CalendarListProps) {
  const months = useMemo(() => generateMonths(), []);
  const flatListRef = useRef<FlatList<MonthData>>(null);

  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    for (const booking of bookings ?? []) {
      for (const d of expandDateRange(
        booking.checkInDate,
        booking.checkOutDate,
        true,
      )) {
        set.add(d);
      }
    }
    return set;
  }, [bookings]);

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
        onDayPress={onDayPress}
        getDayStatus={getDayStatusProp}
        onReloadData={onReloadData}
      />
    ),
    [
      todayString,
      bookings,
      blocks,
      platformBySyncId,
      bookedDates,
      blockedDateInfo,
      onDayPress,
      getDayStatusProp,
      onReloadData,
    ],
  );

  const keyExtractor = useCallback((item: MonthData) => item.key, []);

  return (
    <View style={commonStyles.flex}>
      <View style={[styles.weekdayRow, { paddingHorizontal: spacing.md }]}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekdayCell, { width: CELL_SIZE }]}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        ref={flatListRef}
        data={months}
        extraData={{ bookings, blocks }}
        renderItem={renderMonth}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={MONTHS_IN_PAST}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        maxToRenderPerBatch={3}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 5,
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
