import type { IListingBookingItemDto } from "@repo/skye-hosts-api-client";
import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "../../theme/common-styles";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
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

/** Height of the weekday header row (static) */
const WEEKDAY_ROW_HEIGHT = 18 + spacing.xs;
/** Height of the month label */
const MONTH_LABEL_HEIGHT = 22 + spacing.md * 2;

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

interface CalendarListProps {
  bookings?: IListingBookingItemDto[];
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus;
}

export function CalendarList({
  bookings,
  onDayPress,
  getDayStatus: getDayStatusProp,
}: CalendarListProps) {
  const months = useMemo(() => generateMonths(), []);
  const flatListRef = useRef<FlatList<MonthData>>(null);

  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    for (const booking of bookings ?? []) {
      const start = parseDateString(booking.checkInDate);
      const end = parseDateString(booking.checkOutDate);
      const cur = new Date(start.year, start.month, start.day);
      const endDate = new Date(end.year, end.month, end.day);
      while (cur <= endDate) {
        set.add(
          formatDateString(cur.getFullYear(), cur.getMonth(), cur.getDate()),
        );
        cur.setDate(cur.getDate() + 1);
      }
    }
    return set;
  }, [bookings]);

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
        bookedDates={bookedDates}
        onDayPress={onDayPress}
        getDayStatus={getDayStatusProp}
      />
    ),
    [todayString, bookings, bookedDates, onDayPress, getDayStatusProp],
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
        extraData={bookings}
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
