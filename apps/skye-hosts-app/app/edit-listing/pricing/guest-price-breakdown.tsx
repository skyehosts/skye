import { Ionicons } from "@expo/vector-icons";
import {
  formatGbp,
  GUEST_FEE_SHORT_STAY_RATE,
  STRIPE_PASS_THROUGH_RATE,
} from "@repo/common";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface GuestPriceBreakdownProps {
  hostNetPence: number;
}

export function GuestPriceBreakdown({
  hostNetPence,
}: GuestPriceBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const guestFeePence = Math.round(hostNetPence * GUEST_FEE_SHORT_STAY_RATE);
  const subtotalPence = hostNetPence + guestFeePence;
  const stripePence = Math.round(subtotalPence * STRIPE_PASS_THROUGH_RATE);
  const totalPence = subtotalPence + stripePence;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.header}
        hitSlop={8}
      >
        <Text style={styles.headerText}>
          Guest price {formatGbp(totalPence)}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.icon}
        />
      </Pressable>
      {expanded && (
        <View style={styles.body}>
          <Row label="You receive" value={formatGbp(hostNetPence)} />
          <Row
            label={`Guest service fee (${Math.round(GUEST_FEE_SHORT_STAY_RATE * 100)}%)`}
            value={formatGbp(guestFeePence)}
          />
          <Row
            label={`Card processing (${Math.round(STRIPE_PASS_THROUGH_RATE * 100)}%)`}
            value={formatGbp(stripePence)}
          />
          <View style={styles.divider} />
          <Row
            label="Guest total (1-2 night stays)"
            value={formatGbp(totalPence)}
            emphasis
          />
          <Text style={styles.note}>
            On 3+ night stays, the guest fee is 0% so guests pay less.
          </Text>
        </View>
      )}
    </View>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, emphasis && styles.rowEmphasis]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, emphasis && styles.rowEmphasis]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: spacing.xs,
  },
  headerText: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  body: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  rowEmphasis: {
    color: colors.textPrimary,
    fontSize: typography.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  note: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
