import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import type { BookingSegment } from "../utils/booking-segments";

interface BookingBarProps {
  segment: BookingSegment;
  cellSize: number;
  cellHeight: number;
  cellGap: number;
  isPast: boolean;
}

const CHECK_IN_MARGIN = 5;
const BOTTOM_MARGIN = 5;
const CHECKOUT_PENETRATION = 0.35;

function BookingBarInner({
  segment,
  cellSize,
  cellHeight,
  cellGap,
  isPast,
}: BookingBarProps) {
  const router = useRouter();

  const leftTrim = segment.isCheckIn ? CHECK_IN_MARGIN : 0;
  const barLeft = segment.startDayIndex * (cellSize + cellGap) + leftTrim;

  const spanCount = segment.endDayIndex - segment.startDayIndex + 1;
  const fullSpanWidth = spanCount * cellSize + (spanCount - 1) * cellGap;
  const rightTrim = segment.isCheckOut
    ? cellSize * (1 - CHECKOUT_PENETRATION)
    : 0;
  const barWidth = fullSpanWidth - leftTrim - rightTrim;

  const barHeight = cellHeight * 0.45;

  return (
    <Pressable
      style={[
        styles.bar,
        {
          left: barLeft,
          width: barWidth,
          height: barHeight,
          bottom: BOTTOM_MARGIN,
          backgroundColor: isPast ? colors.calendarBarPast : colors.calendarBar,
          opacity: segment.status === "pending" ? 0.5 : 1,
          zIndex: segment.isCheckIn ? 1 : 0,
          borderTopLeftRadius: segment.isCheckIn ? 150 : 0,
          borderBottomLeftRadius: segment.isCheckIn ? 150 : 0,
          borderTopRightRadius: segment.isCheckOut ? 150 : 0,
          borderBottomRightRadius: segment.isCheckOut ? 150 : 0,
        },
      ]}
      onPress={() => router.push(`/booking/${segment.bookingId}`)}
    >
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {segment.guestFirstName}
        {segment.numberOfGuests > 1 ? ` +${segment.numberOfGuests - 1}` : ""}
      </Text>
    </Pressable>
  );
}

export const BookingBar = React.memo(BookingBarInner);

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  label: {
    color: colors.background,
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
});
