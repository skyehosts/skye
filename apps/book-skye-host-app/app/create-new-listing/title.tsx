import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { colors, commonStyles, spacing, typography } from "../theme";
import { useCreateListing } from "./context";

const MAX_CHARS = 50;

export default function TitleScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (draft.title) setTitle(draft.title);
  }, [draft.title]);

  const typeName = draft.typeName ?? "place";
  const remaining = MAX_CHARS - title.length;

  return (
    <ScreenContainer>
      <WizardAppBar title="Make it stand out" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>
          Now, let&apos;s give your {typeName} a title
        </Text>
        <Text style={commonStyles.subheading}>
          Short titles work best. Have fun with it — you can always change it
          later.
        </Text>

        <TextInput
          value={title}
          onChangeText={(text) =>
            setTitle(text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text)
          }
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          contentStyle={commonStyles.multilineInput}
        />
        <Text style={styles.counter}>{remaining} characters available</Text>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!title.trim()}
          onPress={() => {
            setDraftField("title", title.trim());
            router.push("/create-new-listing/highlights");
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
    fontSize: typography.lg,
  },
  counter: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
