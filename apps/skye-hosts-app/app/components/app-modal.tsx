import { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, commonStyles, spacing } from "../theme";

interface AppModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export function AppModal({ visible, onDismiss, children }: AppModalProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <Pressable style={styles.closeButton} onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.iconMuted} />
        </Pressable>
        {children}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
});
