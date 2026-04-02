import type { IGetListingResponseDto } from "../../../../../packages/skye-hosts-api-client/src";
import { HOUSE_RULES_CONFIG } from "../../../../../packages/skye-hosts-api-client/src";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, commonStyles, spacing } from "../../theme";

interface HouseRulesCardProps {
  listingId: string;
  listing: IGetListingResponseDto | null;
}

export function HouseRulesCard({ listingId, listing }: HouseRulesCardProps) {
  const setRules = HOUSE_RULES_CONFIG.filter(
    (rule) =>
      listing?.[rule.field as keyof IGetListingResponseDto] !== null &&
      listing?.[rule.field as keyof IGetListingResponseDto] !== undefined,
  );

  const subtext = setRules.length === 0 ? "Add details" : null;

  return (
    <Pressable
      style={commonStyles.card}
      onPress={() =>
        router.push({
          pathname: "/edit-listing/house-rules",
          params: { id: listingId },
        })
      }
    >
      <Text style={commonStyles.itemTitle}>House rules</Text>
      {subtext ? (
        <Text style={commonStyles.cardSubtext}>{subtext}</Text>
      ) : (
        <View style={styles.rulesList}>
          {setRules.slice(0, 3).map((rule) => (
            <View key={rule.id} style={styles.ruleRow}>
              <Ionicons
                name={rule.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.iconDecorative}
              />
              <Text style={commonStyles.itemSubtext}>{rule.title}</Text>
            </View>
          ))}
          {setRules.length > 3 && (
            <Text style={commonStyles.itemSubtext}>
              + {setRules.length - 3} more
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rulesList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
