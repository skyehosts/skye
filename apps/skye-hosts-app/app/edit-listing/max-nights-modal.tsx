import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal, Switch } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { NumberStepper } from "../components/number-stepper";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface MaxNightsModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function MaxNightsModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: MaxNightsModalProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState(7);

  useEffect(() => {
    if (visible) {
      setEnabled(listing.maxNights !== null);
      setValue(listing.maxNights ?? 7);
    }
  }, [visible, listing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listing.id}`,
        { maxNights: enabled ? value : null },
        { method: "PATCH" },
      );
      onSaved(updated);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Maximum nights</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Set the longest stay guests can book.
        </Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Limit maximum stay length</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        {enabled && (
          <View style={[commonStyles.borderedRows, { marginTop: spacing.sm }]}>
            <View style={commonStyles.borderedRow}>
              <NumberStepper
                label="Maximum nights"
                value={value}
                onChange={setValue}
                min={1}
                max={30}
              />
            </View>
          </View>
        )}

        <View style={commonStyles.divider} />

        <View style={commonStyles.row}>
          <Button mode="text" onPress={onDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          >
            Save
          </Button>
        </View>
      </Modal>
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
});
