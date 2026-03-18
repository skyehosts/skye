import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export default function SuccessScreen() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();

  return (
    <ScreenContainer style={styles.container}>
      <View style={commonStyles.centered}>
        <Text style={styles.heading}>Congratulations!</Text>
        <Text style={styles.body}>Your listing was successfully created.</Text>
        {listingId && (
          <Button
            mode="contained"
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/edit-listing/edit-photos",
                params: { id: listingId },
              })
            }
          >
            Add photos
          </Button>
        )}
        <Button
          mode={listingId ? "text" : "contained"}
          style={styles.button}
          onPress={() => router.replace("/(tabs)/listings")}
        >
          View my listings
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  heading: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
  },
});
