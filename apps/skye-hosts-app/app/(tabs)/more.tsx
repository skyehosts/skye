import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Button, Icon } from "react-native-paper";
import { AppModal } from "../components/app-modal";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import {
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "../theme";

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon
        source={icon}
        size={22}
        color={danger ? colors.danger : colors.textSecondary}
      />
      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
        {label}
      </Text>
      {!danger && (
        <Icon source="chevron-right" size={22} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [signOutVisible, setSignOutVisible] = useState(false);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Menu" />
      </Appbar.Header>

      <View style={styles.section}>
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

      <View style={styles.section}>
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
            mode="contained"
            onPress={signOut}
            buttonColor={colors.danger}
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
  section: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  menuItemTextDanger: {
    color: colors.danger,
  },
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
