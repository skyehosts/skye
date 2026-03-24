import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { colors, commonStyles, spacing, typography } from "../theme";

export default function LoginSecurityScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Login & Security" />
      </Appbar.Header>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/settings/change-pin")}
        >
          <Icon source="lock-reset" size={22} color={colors.textSecondary} />
          <View style={styles.itemText}>
            <Text style={commonStyles.itemTitle}>Pin number</Text>
            <Text style={styles.description}>
              Change or update your 4-6 digit security PIN
            </Text>
          </View>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  actionText: {
    fontSize: typography.sm,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
