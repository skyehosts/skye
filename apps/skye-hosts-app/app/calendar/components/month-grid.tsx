import type {
  CalendarSyncPlatform,
  ICalendarBlockDto,
  IListingBookingItemDto,
} from "@repo/skye-hosts-api-client";
import React, { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/fonts";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import {
  type BookingSegment,
  type ExternalBlockSegment,
  getBookingSegmentsForMonth,
  getExternalBlockSegmentsForMonth,
} from "../utils/booking-segments";
import { formatDateString } from "../utils/format-date-string";
import { BlockedDateTooltip } from "./blocked-date-tooltip";
import { BookingBar } from "./booking-bar";
import { type BlockedDateInfo } from "./calendar-list";
import { DayCell, type DayCellStatus } from "./day-cell";
import { ExternalBookingBar } from "./external-booking-bar";
import { RestrictedDateTooltip } from "./restricted-date-tooltip";

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

export interface DayPriceInfo {
  hostNetPence: number;
  isOverride: boolean;
}

interface MonthGridProps {
  data: MonthData;
  cellSize: number;
  cellHeight: number;
  cellGap: number;
  todayString: string;
  bookings?: IListingBookingItemDto[];
  blocks?: ICalendarBlockDto[];
  platformBySyncId?: Map<number, CalendarSyncPlatform>;
  bookedDates?: Set<string>;
  blockedDateInfo?: Map<string, BlockedDateInfo[]>;
  restrictedDates?: Set<string>;
  /**
   * Dates where a booking bar overlays the cell (internal bookings + external
   * iCal bookings, including the visual checkout day). Used by DayCell to
   * keep the price from sitting under the bar.
   */
  datesWithBookingBar?: Set<string>;
  pricesByDate?: Map<string, DayPriceInfo>;
  minNights?: number;
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus | undefined;
  onReloadData?: () => void;
  onLongPress?: (dateString: string) => void;
}

function MonthGridInner({
  data,
  cellSize,
  cellHeight,
  cellGap,
  todayString,
  bookings,
  blocks,
  platformBySyncId,
  bookedDates,
  blockedDateInfo,
  restrictedDates,
  datesWithBookingBar,
  pricesByDate,
  minNights: minNightsProp,
  onDayPress,
  getDayStatus,
  onReloadData,
  onLongPress,
}: MonthGridProps) {
  const [tooltipState, setTooltipState] = useState<{
    dateString: string;
    infos: BlockedDateInfo[];
    anchor: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [restrictedTooltip, setRestrictedTooltip] = useState<{
    dateString: string;
    anchor: { x: number; y: number; width: number; height: number };
  } | null>(null);

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

  const externalSegmentsByWeek = useMemo(() => {
    if (!blocks?.length || !platformBySyncId)
      return new Map<number, ExternalBlockSegment[]>();
    const segs = getExternalBlockSegmentsForMonth(
      blocks,
      data,
      platformBySyncId,
    );
    const map = new Map<number, ExternalBlockSegment[]>();
    for (const seg of segs) {
      const arr = map.get(seg.weekIndex);
      if (arr) arr.push(seg);
      else map.set(seg.weekIndex, [seg]);
    }
    return map;
  }, [blocks, platformBySyncId, data]);

  const anchorFromEvent = useCallback(
    (e: GestureResponderEvent) => ({
      x: e.nativeEvent.pageX - e.nativeEvent.locationX,
      y: e.nativeEvent.pageY - e.nativeEvent.locationY,
      width: cellSize,
      height: cellHeight,
    }),
    [cellSize, cellHeight],
  );

  const handleDayPress = useCallback(
    (dateString: string, e: GestureResponderEvent) => {
      const infos = blockedDateInfo?.get(dateString);
      if (infos?.length) {
        const anchor = anchorFromEvent(e);
        setTooltipState({ dateString, infos, anchor });
        return;
      }
      if (restrictedDates?.has(dateString)) {
        const anchor = anchorFromEvent(e);
        setRestrictedTooltip({ dateString, anchor });
        return;
      }
      onDayPress?.(dateString);
    },
    [blockedDateInfo, restrictedDates, anchorFromEvent, onDayPress],
  );

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
                    : blockedDateInfo?.has(dateString)
                      ? "blocked"
                      : restrictedDates?.has(dateString)
                        ? "restricted"
                        : "none"))
                : "none";
              const priceInfo =
                dateString && pricesByDate
                  ? pricesByDate.get(dateString)
                  : undefined;
              const hasBookingBar =
                dateString !== undefined &&
                (datesWithBookingBar?.has(dateString) ?? false);
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
                  hostNetPence={priceInfo?.hostNetPence}
                  isPriceOverride={priceInfo?.isOverride}
                  hasBookingBar={hasBookingBar}
                  onPress={(ds, e) => handleDayPress(ds, e)}
                  onLongPress={onLongPress}
                />
              );
            })}
            {(externalSegmentsByWeek.get(weekIndex) ?? []).map((seg) => {
              const endDay = week[seg.endDayIndex];
              const segEndDate =
                endDay !== null
                  ? formatDateString(data.year, data.month, endDay)
                  : todayString;
              return (
                <ExternalBookingBar
                  key={`ext-${seg.blockId}-${seg.weekIndex}`}
                  segment={seg}
                  cellSize={cellSize}
                  cellHeight={cellHeight}
                  cellGap={cellGap}
                  isPast={segEndDate < todayString}
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
      {tooltipState && (
        <BlockedDateTooltip
          infos={tooltipState.infos}
          dateString={tooltipState.dateString}
          anchor={tooltipState.anchor}
          onClose={() => setTooltipState(null)}
          onReloadData={onReloadData}
        />
      )}
      {restrictedTooltip && (
        <RestrictedDateTooltip
          dateString={restrictedTooltip.dateString}
          minNights={minNightsProp ?? 1}
          anchor={restrictedTooltip.anchor}
          onClose={() => setRestrictedTooltip(null)}
        />
      )}
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
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.lg,
    color: colors.primary,
    paddingVertical: spacing.md,
  },
  weekRow: {
    flexDirection: "row",
  },
});
