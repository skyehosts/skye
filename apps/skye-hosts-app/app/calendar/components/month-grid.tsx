import type { IListingBookingItemDto } from "@repo/skye-hosts-api-client";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import {
  type BookingSegment,
  getBookingSegmentsForMonth,
} from "../utils/booking-segments";
import { formatDateString } from "../utils/format-date-string";
import { BookingBar } from "./booking-bar";
import { DayCell, type DayCellStatus } from "./day-cell";

export interface MonthData {
  /** Unique key e.g. "2026-03" */
  key: string;
  /** Display label e.g. "March 2026" */
  label: string;
  /** Year number */
  year: number;
  /** Month number (0-11) */
  month: number;
  /**
   * Grid of weeks. Each week is 7 slots (Mon–Sun).
   * null = empty slot, number = day of month.
   */
  weeks: (number | null)[][];
}

interface MonthGridProps {
  data: MonthData;
  cellSize: number;
  cellHeight: number;
  cellGap: number;
  todayString: string;
  bookings?: IListingBookingItemDto[];
  bookedDates?: Set<string>;
  blockedDates?: Set<string>;
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus;
}

function MonthGridInner({
  data,
  cellSize,
  cellHeight,
  cellGap,
  todayString,
  bookings,
  bookedDates,
  blockedDates,
  onDayPress,
  getDayStatus,
}: MonthGridProps) {
  const segmentsByWeek = useMemo(() => {
    if (!bookings?.length) return new Map<number, BookingSegment[]>();
    const segs = getBookingSegmentsForMonth(bookings, data);
    const map = new Map<number, BookingSegment[]>();
    for (const seg of segs) {
      const arr = map.get(seg.weekIndex);
      if (arr) arr.push(seg);
      else map.set(seg.weekIndex, [seg]);
    }
    return map;
  }, [bookings, data]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>{data.label}</Text>
      <View style={{ rowGap: cellGap }}>
        {data.weeks.map((week, weekIndex) => (
          <View
            key={weekIndex}
            style={[styles.weekRow, { columnGap: cellGap }]}
          >
            {week.map((day, dayIndex) => {
              const dateString =
                day !== null
                  ? formatDateString(data.year, data.month, day)
                  : undefined;
              const status: DayCellStatus = dateString
                ? (getDayStatus?.(dateString) ??
                  (bookedDates?.has(dateString)
                    ? "booked"
                    : blockedDates?.has(dateString)
                      ? "blocked"
                      : "none"))
                : "none";
              return (
                <DayCell
                  key={dayIndex}
                  day={day}
                  dateString={dateString}
                  isToday={dateString === todayString}
                  isPast={dateString !== undefined && dateString < todayString}
                  status={status}
                  size={cellSize}
                  height={cellHeight}
                  onPress={onDayPress}
                />
              );
            })}
            {(segmentsByWeek.get(weekIndex) ?? []).map((seg) => {
              const endDay = week[seg.endDayIndex];
              const segEndDate =
                endDay !== null
                  ? formatDateString(data.year, data.month, endDay)
                  : todayString;
              return (
                <BookingBar
                  key={`${seg.bookingId}-${seg.weekIndex}`}
                  segment={seg}
                  cellSize={cellSize}
                  cellHeight={cellHeight}
                  cellGap={cellGap}
                  isPast={segEndDate < todayString}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export const MonthGrid = React.memo(MonthGridInner);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  monthLabel: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    paddingVertical: spacing.md,
  },
  weekRow: {
    flexDirection: "row",
  },
});
