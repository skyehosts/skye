import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { colors, commonStyles, spacing, typography } from "../theme";
import { useCreateListing } from "./context";

const GENERATED_DESCRIPTION =
  "Your family will be close to everything when you stay at this centrally-located place.";

export default function DescriptionScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [description, setDescription] = useState(GENERATED_DESCRIPTION);

  useEffect(() => {
    if (draft.description) setDescription(draft.description);
  }, [draft.description]);

  return (
    <ScreenContainer>
      <WizardAppBar title="Make it stand out" />

      <View style={commonStyles.content}>
        <Text style={[commonStyles.heading, { marginBottom: spacing.xl }]}>
          Create your description
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
          contentStyle={commonStyles.multilineInput}
        />
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!description.trim()}
          onPress={() => {
            setDraftField("description", description.trim());
            router.push("/create-new-listing/booking-settings");
          }}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.background,
    fontSize: typography.md,
  },
});
