import { Ionicons } from "@expo/vector-icons";
import {
  formatGbp,
  PRICING_SEASON_DESCRIPTIONS,
  PRICING_SEASON_LABELS,
  type PricingSeasonId,
} from "@repo/common";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, commonStyles, spacing, typography } from "../../theme";

interface SeasonCardProps {
  season: PricingSeasonId;
  weekdayPricePence?: number;
  weekendPricePence?: number;
  onPress: () => void;
}

export function SeasonCard({
  season,
  weekdayPricePence,
  weekendPricePence,
  onPress,
}: SeasonCardProps) {
  const hasPrices =
    weekdayPricePence !== undefined &&
    weekendPricePence !== undefined &&
    weekdayPricePence > 0 &&
    weekendPricePence > 0;

  return (
    <Pressable style={[commonStyles.card, styles.card]} onPress={onPress}>
      <View style={styles.textCol}>
        <Text style={commonStyles.itemTitle}>
          {PRICING_SEASON_LABELS[season]}
        </Text>
        <Text style={commonStyles.itemSubtext}>
          {PRICING_SEASON_DESCRIPTIONS[season]}
        </Text>
        <Text style={styles.priceLine}>
          {hasPrices
            ? `Weekday ${formatGbp(weekdayPricePence)} · Weekend ${formatGbp(
                weekendPricePence,
              )}`
            : "Not set"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
  },
  priceLine: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
