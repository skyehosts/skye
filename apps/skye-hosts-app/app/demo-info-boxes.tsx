import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { InfoBox } from "./components/info-box";
import { ScreenContainer } from "./components/screen-container";
import { commonStyles, spacing, typography } from "./theme";

export default function DemoInfoBoxesScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Demo" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Info</Text>
          <InfoBox variant="info">
            Keep your calendars in sync across platforms to avoid double
            bookings. Changes may take up to 3 hours to appear on other
            platforms.
          </InfoBox>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Info with custom icon</Text>
          <InfoBox variant="info" icon="gesture-swipe">
            Long press and drag to reorder. The first photo is your cover image,
            and the first 5 are featured on your listing page.
          </InfoBox>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Warning</Text>
          <InfoBox variant="warning">
            Set up 2-way sync for best protection against double-bookings.
            Syncing only one direction may still result in overlapping
            reservations.
          </InfoBox>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Error</Text>
          <InfoBox variant="error">
            Something went wrong while saving your changes. Please try again or
            contact support if the problem persists.
          </InfoBox>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
});
