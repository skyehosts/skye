import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
 */
export type DayCellStatus =
  | "none"
  | "selected"
  | "checkIn"
  | "checkOut"
  | "booked";

interface DayCellProps {
  /** Day of the month (1-31), or null for empty grid slots */
  day: number | null;
  /** Full date string YYYY-MM-DD, undefined for empty slots */
  dateString?: string;
  /** Whether this day is today */
  isToday: boolean;
  /** Booking/selection status for future use */
  status: DayCellStatus;
  /** Cell width — calculated by parent to fill 1/7 of available width */
  size: number;
  /** Called with the dateString when the day is pressed */
  onPress?: (dateString: string) => void;
}

function DayCellInner({
  day,
  dateString,
  isToday,
  size,
  onPress,
}: DayCellProps) {
  if (day === null) {
    return <View style={[styles.cell, { width: size, height: size }]} />;
  }

  const handlePress = () => {
    if (dateString && onPress) {
      onPress(dateString);
    }
  };

  return (
    <Pressable
      style={[styles.cell, { width: size, height: size }]}
      onPress={handlePress}
    >
      <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
        <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
      </View>
    </Pressable>
  );
}

export const DayCell = React.memo(DayCellInner);

const DAY_INNER_SIZE = 32;

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayContainer: {
    width: DAY_INNER_SIZE,
    height: DAY_INNER_SIZE,
    borderRadius: DAY_INNER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todayContainer: {
    backgroundColor: colors.textPrimary,
  },
  dayText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.normal,
    color: colors.textPrimary,
  },
  todayText: {
    color: colors.background,
    fontWeight: fontWeight.semibold,
  },
});
