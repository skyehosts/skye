import type { ListingStatus } from "../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Modal, Portal, RadioButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "./action-bar";
import { colors, commonStyles, spacing, typography } from "../theme";

interface ListingStatusModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentStatus: ListingStatus;
  shortTermLetLicenseConfirmed: boolean;
  onSave: (status: ListingStatus) => void;
  loading?: boolean;
}

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "active", label: "Listed" },
  { value: "inactive", label: "Unlisted" },
];

function validateCanList(shortTermLetLicenseConfirmed: boolean): string | null {
  if (!shortTermLetLicenseConfirmed) {
    return "You must confirm your short-term let license before listing your property. Go to 'Highland council short-term let laws' to confirm.";
  }
  return null;
}

export function ListingStatusModal({
  visible,
  onDismiss,
  currentStatus,
  shortTermLetLicenseConfirmed,
  onSave,
  loading,
}: ListingStatusModalProps) {
  const [selected, setSelected] = useState<ListingStatus>(currentStatus);
  const [validationError, setValidationError] = useState("");

  const handleSelect = (value: ListingStatus) => {
    setValidationError("");
    if (value === "active") {
      const error = validateCanList(shortTermLetLicenseConfirmed);
      if (error) {
        setValidationError(error);
        return;
      }
    }
    setSelected(value);
  };

  const handleSave = () => {
    if (selected === "active") {
      const error = validateCanList(shortTermLetLicenseConfirmed);
      if (error) {
        setValidationError(error);
        return;
      }
    }
    onSave(selected);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Change listing status</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <Text style={commonStyles.itemSubtext}>
          Control whether your listing is visible to guests. Unlisted properties
          won't appear in search results.
        </Text>

        <RadioButton.Group
          value={selected}
          onValueChange={(v) => handleSelect(v as ListingStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={styles.option}
              onPress={() => handleSelect(option.value)}
            >
              <RadioButton value={option.value} />
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </RadioButton.Group>

        {validationError !== "" && (
          <Text style={commonStyles.errorText}>{validationError}</Text>
        )}

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSave}
          loading={loading}
          saveDisabled={selected === currentStatus}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  optionLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
});
