import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "../components/action-bar";
import { AppSnackbar } from "../components/app-snackbar";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface GuestsModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function GuestsModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: GuestsModalProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [maxGuests, setMaxGuests] = useState(listing.maxGuests);

  useEffect(() => {
    if (visible) {
      setMaxGuests(listing.maxGuests);
    }
  }, [visible, listing.maxGuests]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listing.id}`, { maxGuests }, { method: "PATCH" });
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
          <Text style={commonStyles.modalTitle}>Edit guests</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <Text style={commonStyles.bodyText}>
          How many guests can fit comfortably in your space?
        </Text>

        <View style={styles.stepper}>
          <IconButton
            icon="minus"
            mode="outlined"
            size={22}
            iconColor={colors.primary}
            style={{ borderColor: colors.primary }}
            disabled={maxGuests <= 1}
            onPress={() => setMaxGuests((v) => Math.max(1, v - 1))}
          />
          <Text style={styles.count}>{maxGuests}</Text>
          <IconButton
            icon="plus"
            mode="outlined"
            size={22}
            iconColor={colors.primary}
            style={{ borderColor: colors.primary }}
            onPress={() => setMaxGuests((v) => v + 1)}
          />
        </View>

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSave}
          loading={saving}
          showDivider
        />
      </Modal>
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  count: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: "center",
  },
});
