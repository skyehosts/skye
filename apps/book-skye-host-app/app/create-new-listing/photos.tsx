import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { colors, commonStyles, spacing } from "../theme";

export default function PhotosScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <WizardAppBar title="Make it stand out" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>Add some photos</Text>
        <Text style={commonStyles.subheading}>
          You&apos;ll need 5 photos to get started. You can add more or make
          changes later.
        </Text>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            icon="plus"
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={() => {}}
          >
            Add photos
          </Button>
          <Button
            mode="outlined"
            icon="camera-outline"
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={() => {}}
          >
            Take new photos
          </Button>
        </View>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/create-new-listing/title")}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  buttons: {
    gap: spacing.md,
  },
  button: {
    borderColor: colors.border,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
