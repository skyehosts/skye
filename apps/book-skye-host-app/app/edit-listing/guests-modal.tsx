import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "@repo/skye-hosts-api-client";
import { applyServerErrors } from "@repo/web-components/forms/apply-server-errors";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, IconButton, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

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
  const { setError } = useForm();
  const [saving, setSaving] = useState(false);
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
      if (applyServerErrors(e, setError)) return;
      throw e;
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
            <Ionicons name="close" size={22} color={colors.textSecondary} />
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
            disabled={maxGuests <= 1}
            onPress={() => setMaxGuests((v) => Math.max(1, v - 1))}
          />
          <Text style={styles.count}>{maxGuests}</Text>
          <IconButton
            icon="plus"
            mode="outlined"
            size={22}
            onPress={() => setMaxGuests((v) => v + 1)}
          />
        </View>

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
