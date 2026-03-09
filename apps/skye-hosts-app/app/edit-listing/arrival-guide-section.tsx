import { StyleSheet, Text, View } from "react-native";
import { commonStyles, spacing } from "../theme";

interface ArrivalGuideSectionProps {
  listingId: string;
}

export function ArrivalGuideSection({ listingId }: ArrivalGuideSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={commonStyles.sectionTitle}>Arrival guide</Text>
      <Text style={commonStyles.sectionSubtext}>
        Provide guests with arrival instructions and house rules.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});
