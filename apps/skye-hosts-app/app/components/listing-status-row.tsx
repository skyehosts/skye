import type { ListingStatus } from "../../../../packages/skye-hosts-api-client/src";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, commonStyles, spacing } from "../theme";

interface ListingStatusRowProps {
  status: ListingStatus;
  onPress: () => void;
}

function getStatusDisplay(status: ListingStatus) {
  if (status === "active") {
    return { label: "Listed", color: colors.success };
  }
  return { label: "Unlisted", color: colors.warning };
}

export function ListingStatusRow({ status, onPress }: ListingStatusRowProps) {
  const { label, color } = getStatusDisplay(status);

  return (
    <Pressable style={commonStyles.borderedRowContent} onPress={onPress}>
      <View style={commonStyles.borderedRowText}>
        <Text style={commonStyles.itemTitle}>Listing status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={commonStyles.itemSubtext}>{label}</Text>
        </View>
      </View>
      <Text style={commonStyles.menuItemAction}>Edit</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
