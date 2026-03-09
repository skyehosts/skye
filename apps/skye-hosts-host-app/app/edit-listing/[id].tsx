import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Appbar, SegmentedButtons } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { spacing } from "../theme";
import { ArrivalGuideSection } from "./arrival-guide-section";
import { YourSpaceSection } from "./your-space-section";

type Section = "your-space" | "arrival-guide";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [section, setSection] = useState<Section>("your-space");

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Listing editor" />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SegmentedButtons
          value={section}
          onValueChange={(value) => setSection(value as Section)}
          buttons={[
            { value: "your-space", label: "Your space" },
            { value: "arrival-guide", label: "Arrival guide" },
          ]}
          style={styles.segmentedButtons}
        />

        {section === "your-space" && <YourSpaceSection listingId={id} />}
        {section === "arrival-guide" && <ArrivalGuideSection listingId={id} />}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  segmentedButtons: {
    marginBottom: spacing.lg,
  },
});
