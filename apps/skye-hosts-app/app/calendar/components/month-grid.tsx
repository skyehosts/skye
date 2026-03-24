import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { formatDateString } from "../utils/format-date-string";
import { DayCell, type DayCellStatus } from "./day-cell";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  todayString: string;
  onDayPress?: (dateString: string) => void;
  getDayStatus?: (dateString: string) => DayCellStatus;
}

function MonthGridInner({
  data,
  cellSize,
  todayString,
  onDayPress,
  getDayStatus,
}: MonthGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>{data.label}</Text>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekdayCell, { width: cellSize }]}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      {data.weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            const dateString =
              day !== null
                ? formatDateString(data.year, data.month, day)
                : undefined;
            const status = dateString
              ? (getDayStatus?.(dateString) ?? "none")
              : "none";
            return (
              <DayCell
                key={dayIndex}
                day={day}
                dateString={dateString}
                isToday={dateString === todayString}
                status={status}
                size={cellSize}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
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
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    alignItems: "center",
  },
  weekdayText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  weekRow: {
    flexDirection: "row",
  },
});
