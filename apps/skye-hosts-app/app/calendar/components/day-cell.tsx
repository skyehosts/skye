import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius } from "../../theme/border-radius";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { typography } from "../../theme/typography";

/**
 * Represents the booking/selection status of a day cell.
 * - none: default, no status
 * - selected: individually selected by the user
 * - checkIn: half-day check-in (booking starts afternoon)
 * - checkOut: half-day check-out (booking ends morning)
 * - booked: fully booked day
 * - blocked: blocked via calendar sync or manual block
 * - restricted: available but unbookable due to minimum nights gap
 */
export type DayCellStatus =
  | "none"
  | "selected"
  | "checkIn"
  | "checkOut"
  | "booked"
  | "blocked"
  | "restricted";

interface DayCellProps {
  /** Day of the month (1-31), or null for empty grid slots */
  day: number | null;
  /** Full date string YYYY-MM-DD, undefined for empty slots */
  dateString?: string;
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this day is in the past */
  isPast: boolean;
  /** Booking/selection status for future use */
  status: DayCellStatus;
  /** Cell width — calculated by parent to fill 1/7 of available width */
  size: number;
  /** Cell height — defaults to size if not provided */
  height?: number;
  /** Called with the dateString when the day is pressed */
  onPress?: (dateString: string) => void;
  /** Called with the dateString when the day is long-pressed */
  onLongPress?: (dateString: string) => void;
}

function DayCellInner({
  day,
  dateString,
  isToday,
  isPast,
  status,
  size,
  height,
  onPress,
  onLongPress,
}: DayCellProps) {
  const cellHeight = height ?? size;
  if (day === null) {
    return <View style={[styles.cell, { width: size, height: cellHeight }]} />;
  }

  const handlePress = () => {
    if (dateString && onPress) {
      onPress(dateString);
    }
  };

  const handleLongPress = () => {
    if (dateString && onLongPress) {
      onLongPress(dateString);
    }
  };

  return (
    <Pressable
      style={[
        styles.cell,
        { width: size, height: cellHeight, opacity: isPast ? 0.8 : 1 },
        status === "selected" && !isPast
          ? styles.cellSelected
          : status === "booked" && !isPast
            ? styles.cellBooked
            : status === "blocked" && !isPast
              ? styles.cellBlocked
              : status === "restricted" && !isPast
                ? styles.cellRestricted
                : isPast
                  ? styles.cellPast
                  : styles.cellCurrent,
        status === "selected" && !isPast && styles.cellSelectedBorder,
        status === "booked" && !isPast && styles.cellBookedBorder,
        status === "blocked" && !isPast && styles.cellBlockedBorder,
        status === "restricted" && !isPast && styles.cellRestrictedBorder,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
        <Text
          style={[
            styles.dayText,
            isPast && styles.dayTextPast,
            isToday && styles.todayText,
          ]}
        >
          {day}
        </Text>
      </View>
    </Pressable>
  );
}

export const DayCell = React.memo(DayCellInner);

const DAY_INNER_SIZE = 32;

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 7,
    borderRadius: borderRadius.xs,
  },
  cellPast: {
    backgroundColor: colors.calendarCellPast,
  },
  cellCurrent: {
    backgroundColor: colors.calendarCellCurrent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellBooked: {
    backgroundColor: colors.background,
  },
  cellBookedBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellBlocked: {
    backgroundColor: colors.calendarCellBlocked,
  },
  cellBlockedBorder: {
    borderWidth: 1,
    borderColor: colors.calendarCellBlockedBorder,
    borderStyle: "dashed",
  },
  cellRestricted: {
    backgroundColor: colors.calendarCellRestricted,
  },
  cellRestrictedBorder: {
    borderWidth: 1,
    borderColor: colors.calendarCellRestrictedBorder,
    borderStyle: "dashed",
  },
  cellSelected: {
    backgroundColor: colors.calendarCellSelected,
  },
  cellSelectedBorder: {
    borderWidth: 1,
    borderColor: colors.calendarCellSelectedBorder,
  },
  dayContainer: {
    width: DAY_INNER_SIZE,
    height: DAY_INNER_SIZE,
    borderRadius: DAY_INNER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.normal,
    color: colors.textPrimary,
  },
  dayTextPast: {
    color: colors.calendarTextPast,
  },
  todayText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
