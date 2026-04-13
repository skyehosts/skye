import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
} from "react-native";
import type { CalendarSyncPlatform } from "@repo/skye-hosts-api-client";
import AirbnbLogo from "../../../assets/icons/airbnb-logo.svg";
import BookingLogo from "../../../assets/icons/booking-logo.svg";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import type { ExternalBlockSegment } from "../utils/booking-segments";
import { getPlatformName } from "../utils/platform-helpers";
import { PositionedTooltip } from "./positioned-tooltip";
import { tooltipStyles } from "./tooltip-styles";

interface ExternalBookingBarProps {
  segment: ExternalBlockSegment;
  cellSize: number;
  cellHeight: number;
  cellGap: number;
  isPast: boolean;
}

const CHECK_IN_MARGIN = 5;
const BOTTOM_MARGIN = 5;
const CHECKOUT_PENETRATION = 0.35;

function getPlatformColor(platform: CalendarSyncPlatform | null): string {
  switch (platform) {
    case "booking_com":
      return colors.calendarBarBookingCom;
    case "airbnb":
      return colors.calendarBarAirbnb;
    default:
      return colors.calendarBarExternal;
  }
}

function getPlatformLabel(platform: CalendarSyncPlatform | null): string {
  switch (platform) {
    case "booking_com":
      return "B";
    case "airbnb":
      return "A";
    default:
      return "•";
  }
}

function PlatformIcon({ platform }: { platform: CalendarSyncPlatform | null }) {
  const size = 24;
  // SVG transformer converts imports to components; without a rebuild they
  // resolve to numeric asset IDs. Fall back to a text label in that case.
  const Logo =
    platform === "airbnb"
      ? AirbnbLogo
      : platform === "booking_com"
        ? BookingLogo
        : null;

  if (Logo && typeof Logo === "function") {
    return <Logo width={size} height={size} />;
  }
  return <Text style={styles.label}>{getPlatformLabel(platform)}</Text>;
}

function formatBlockDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ExternalBookingBarInner({
  segment,
  cellSize,
  cellHeight,
  cellGap,
  isPast,
}: ExternalBookingBarProps) {
  const [tooltipAnchor, setTooltipAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const leftTrim = segment.isStart ? CHECK_IN_MARGIN : 0;
  const barLeft = segment.startDayIndex * (cellSize + cellGap) + leftTrim;

  const spanCount = segment.endDayIndex - segment.startDayIndex + 1;
  const fullSpanWidth = spanCount * cellSize + (spanCount - 1) * cellGap;
  const rightTrim = segment.isEnd ? cellSize * (1 - CHECKOUT_PENETRATION) : 0;
  const barWidth = fullSpanWidth - leftTrim - rightTrim;

  const barHeight = cellHeight * 0.45;
  const platformColor = getPlatformColor(segment.platform);

  return (
    <>
      <Pressable
        style={[
          styles.bar,
          {
            left: barLeft,
            width: barWidth,
            height: barHeight,
            bottom: BOTTOM_MARGIN,
            backgroundColor: platformColor,
            opacity: isPast ? 0.5 : 1,
            borderTopLeftRadius: segment.isStart ? 150 : 0,
            borderBottomLeftRadius: segment.isStart ? 150 : 0,
            borderTopRightRadius: segment.isEnd ? 150 : 0,
            borderBottomRightRadius: segment.isEnd ? 150 : 0,
          },
        ]}
        onPress={(e: GestureResponderEvent) => {
          setTooltipAnchor({
            x: e.nativeEvent.pageX - e.nativeEvent.locationX,
            y: e.nativeEvent.pageY - e.nativeEvent.locationY,
            width: barWidth,
            height: barHeight,
          });
        }}
      >
        {(segment.isStart || !segment.isEnd) && (
          <PlatformIcon platform={segment.platform} />
        )}
      </Pressable>
      {tooltipAnchor && (
        <PositionedTooltip
          anchor={tooltipAnchor}
          onClose={() => setTooltipAnchor(null)}
        >
          <Text style={tooltipStyles.title}>
            Booked on {getPlatformName(segment.platform)}
          </Text>
          <Text style={tooltipStyles.text}>
            {formatBlockDate(segment.startDate)} –{" "}
            {formatBlockDate(segment.endDate)}
          </Text>
        </PositionedTooltip>
      )}
    </>
  );
}

export const ExternalBookingBar = React.memo(ExternalBookingBarInner);

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: fontWeight.bold,
  },
});
