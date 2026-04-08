import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { AppModal } from "../components/app-modal";
import { MenuItem } from "../components/menu-item";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { env } from "../services/env";
import {
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "../theme";

export default function MoreScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [signOutVisible, setSignOutVisible] = useState(false);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Menu" />
      </Appbar.Header>

      <View style={commonStyles.menuSection}>
        <MenuItem
          icon="cash-multiple"
          label="Earnings"
          onPress={() => router.push("/settings/earnings")}
        />
        <MenuItem
          icon="account-outline"
          label="Personal details"
          onPress={() => router.push("/settings/personal-details")}
        />
        <MenuItem
          icon="bell-outline"
          label="Notifications"
          onPress={() => router.push("/settings/notifications")}
        />
        <MenuItem
          icon="shield-lock-outline"
          label="Login & Security"
          onPress={() => router.push("/settings/login-security")}
        />
        <MenuItem
          icon="eye-off-outline"
          label="Privacy"
          onPress={() => router.push("/settings/privacy")}
        />
        <MenuItem
          icon="credit-card-outline"
          label="Payments"
          onPress={() => router.push("/settings/payments")}
        />
      </View>

      {(__DEV__ || env.showDevMenu) && (
        <View style={commonStyles.menuSection}>
          <MenuItem
            icon="palette-outline"
            label="Style Guide"
            onPress={() => router.push("/style-guide")}
          />
          <MenuItem
            icon="flask-outline"
            label="Demo Form"
            onPress={() => router.push("/demo-form")}
          />
        </View>
      )}

      <View style={commonStyles.menuSection}>
        <MenuItem
          icon="logout"
          label="Sign out"
          onPress={() => setSignOutVisible(true)}
          danger
        />
      </View>

      <AppModal
        visible={signOutVisible}
        onDismiss={() => setSignOutVisible(false)}
      >
        <Text style={commonStyles.modalTitle}>Sign out</Text>
        <Text style={styles.modalMessage}>
          Are you sure you want to sign out?
        </Text>
        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setSignOutVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="outlined"
            onPress={signOut}
            textColor={colors.danger}
            style={styles.modalButton}
          >
            Sign out
          </Button>
        </View>
      </AppModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modalMessage: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: lineHeight.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
