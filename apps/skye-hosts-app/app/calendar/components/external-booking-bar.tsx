import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Portal } from "react-native-paper";
import type { CalendarSyncPlatform } from "@repo/skye-hosts-api-client";
import AirbnbLogo from "../../../assets/icons/airbnb-logo.svg";
import BookingLogo from "../../../assets/icons/booking-logo.svg";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import type { ExternalBlockSegment } from "../utils/booking-segments";
import { getPlatformName } from "../utils/platform-helpers";
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
const CHECKOUT_PENETRATION = 0.14;

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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [barLayout, setBarLayout] = useState<{
    x: number;
    y: number;
    width: number;
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
          },
        ]}
        onLayout={(e) => {
          e.target.measureInWindow((x, y, width) => {
            setBarLayout({ x, y, width });
          });
        }}
        onPress={() => setTooltipVisible(true)}
      >
        <PlatformIcon platform={segment.platform} />
      </Pressable>
      {tooltipVisible && barLayout && (
        <Portal>
          <Pressable
            style={tooltipStyles.backdrop}
            onPress={() => setTooltipVisible(false)}
          >
            <View
              style={[
                tooltipStyles.tooltip,
                {
                  left: Math.max(8, barLayout.x),
                  top: barLayout.y - 80,
                },
              ]}
            >
              <Text style={tooltipStyles.title}>
                Booked on {getPlatformName(segment.platform)}
              </Text>
              <Text style={tooltipStyles.text}>
                {formatBlockDate(segment.startDate)} –{" "}
                {formatBlockDate(segment.endDate)}
              </Text>
            </View>
          </Pressable>
        </Portal>
      )}
    </>
  );
}

export const ExternalBookingBar = React.memo(ExternalBookingBarInner);

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    borderRadius: 150,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: fontWeight.bold,
  },
});
