import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { commonStyles } from "../../theme/common-styles";
import { spacing } from "../../theme/spacing";
import { formatDateString } from "../utils/format-date-string";
import type { DayCellStatus } from "./day-cell";
import { MonthGrid, type MonthData } from "./month-grid";

const MONTHS_IN_PAST = 6;
const MONTHS_IN_FUTURE = 18;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_SIZE = (SCREEN_WIDTH - spacing.md * 2) / 7;

/** Height of the weekday header row */
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
  const weekRows = month.weeks.length * CELL_SIZE;
  return MONTH_LABEL_HEIGHT + WEEKDAY_ROW_HEIGHT + weekRows + spacing.lg;
}

interface CalendarListProps {
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus;
}

export function CalendarList({ onDayPress, getDayStatus }: CalendarListProps) {
  const months = useMemo(() => generateMonths(), []);
  const flatListRef = useRef<FlatList<MonthData>>(null);

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
        todayString={todayString}
        onDayPress={onDayPress}
        getDayStatus={getDayStatus}
      />
    ),
    [todayString, onDayPress, getDayStatus],
  );

  const keyExtractor = useCallback((item: MonthData) => item.key, []);

  return (
    <View style={commonStyles.flex}>
      <FlatList
        ref={flatListRef}
        data={months}
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
