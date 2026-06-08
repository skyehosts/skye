import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import { InfoBox } from "../../components/info-box";
import { borderRadius } from "../../theme/border-radius";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface DateBlockSheetProps {
  visible: boolean;
  /** Inclusive start date YYYY-MM-DD */
  startDate: string;
  /** Exclusive end date YYYY-MM-DD (iCal DTEND semantics) */
  endDate: string;
  /** Whether the selected range contains any manual blocks */
  hasManualBlocks: boolean;
  /** Whether the selected range contains any unblocked dates */
  hasUnblockedDates: boolean;
  /** Whether the selected range contains any booked dates */
  hasBookedDates: boolean;
  loading: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  onSetPriceOverride?: () => void;
  onDismiss: () => void;
}

function getRangeInfo(
  startDate: string,
  endDate: string,
): { label: string; isSingleDay: boolean } {
  const start = parseISO(startDate);
  // endDate is exclusive, so subtract 1 day for display
  const end = parseISO(endDate);
  end.setDate(end.getDate() - 1);

  const startStr = format(start, "d MMM");
  const endStr = format(end, "d MMM yyyy");

  const diffDays = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1,
  );

  if (diffDays === 1) {
    return {
      label: `${startStr} ${start.getFullYear()} (1 day)`,
      isSingleDay: true,
    };
  }
  return {
    label: `${startStr} – ${endStr} (${diffDays} days)`,
    isSingleDay: false,
  };
}

export function DateBlockSheet({
  visible,
  startDate,
  endDate,
  hasManualBlocks,
  hasUnblockedDates,
  hasBookedDates,
  loading,
  onBlock,
  onUnblock,
  onSetPriceOverride,
  onDismiss,
}: DateBlockSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  const { label: rangeLabel, isSingleDay } = getRangeInfo(startDate, endDate);

  return (
    <Portal>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{rangeLabel}</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          {hasUnblockedDates && onSetPriceOverride && (
            <Button
              mode="contained"
              onPress={onSetPriceOverride}
              disabled={loading}
              icon="currency-gbp"
              style={styles.actionButton}
            >
              Set custom price
            </Button>
          )}
          {hasUnblockedDates && (
            <Button
              mode="outlined"
              onPress={onBlock}
              loading={loading}
              disabled={loading}
              icon="calendar-remove"
              style={styles.actionButton}
            >
              {isSingleDay ? "Block this date" : "Block these dates"}
            </Button>
          )}
          {hasManualBlocks && (
            <Button
              mode={hasUnblockedDates ? "outlined" : "contained"}
              onPress={onUnblock}
              loading={loading}
              disabled={loading}
              icon="calendar-check"
              style={styles.actionButton}
            >
              {isSingleDay ? "Unblock this date" : "Unblock these dates"}
            </Button>
          )}
        </View>

        {!hasUnblockedDates && (
          <InfoBox variant="info">
            {hasManualBlocks
              ? "Only your manually blocked dates can be unblocked here. Dates imported from Airbnb must be unblocked on that platform \u2014 changes will sync automatically within a few hours, or tap the sync icon above and then \u2018Import now\u2019 for immediate effect."
              : hasBookedDates
                ? "These dates already have a booking."
                : "These dates are blocked on Airbnb and have been automatically imported into your calendar. To unblock them, update your availability on Airbnb \u2014 changes will sync within a few hours, or tap the sync icon above and then \u2018Import now\u2019 for immediate effect."}
          </InfoBox>
        )}

        <Button mode="text" onPress={onDismiss} disabled={loading}>
          Cancel
        </Button>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    borderRadius: borderRadius.sm,
  },
});
