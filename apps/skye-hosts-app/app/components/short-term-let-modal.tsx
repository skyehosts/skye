import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Checkbox, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "./action-bar";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

interface ShortTermLetModalProps {
  visible: boolean;
  onDismiss: () => void;
  confirmed: boolean;
  onSave: (confirmed: boolean) => void;
  loading?: boolean;
}

export function ShortTermLetModal({
  visible,
  onDismiss,
  confirmed,
  onSave,
  loading,
}: ShortTermLetModalProps) {
  const [checked, setChecked] = useState(confirmed);

  const handleSave = () => {
    onSave(checked);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Local laws in Scotland</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bodyText}>
            In Scotland, it is a legal requirement as a new Host that you obtain
            a short-term lets licence before accepting any bookings.
          </Text>

          <Text style={styles.bodyText}>
            If your listing has been operating before 1 October 2022 (on or off
            Airbnb), you have until 30 September 2023 to apply for a licence and
            may continue to accept bookings while you await your local
            authority's decision.
          </Text>

          <Text style={styles.bodyText}>
            Exclusions, requirements and more information related to planning
            and licensing can be found on the Scottish Government website.
          </Text>

          <Text style={styles.bodyText}>
            More details, including how to apply for a licence, can be found
            here (mygov.scot/short-term-let-licences)
          </Text>
        </ScrollView>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setChecked((v) => !v)}
        >
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => setChecked((v) => !v)}
          />
          <Text style={styles.checkboxLabel}>
            I understand that by accepting our Terms of Service and listing my
            space, I certify that I will follow applicable laws and regulations.
          </Text>
        </Pressable>

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSave}
          saveLabel="Confirm"
          loading={loading}
          saveDisabled={checked === confirmed}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    gap: spacing.md,
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  bodyText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
    paddingTop: spacing.xs,
  },
});
