import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import {
  HOST_INTERACTION_OPTIONS,
  type HostInteractionId,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Modal, Portal, RadioButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "../../components/action-bar";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import { colors, commonStyles, spacing, typography } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

interface HostInteractionCardProps {
  listingId: string;
  hostInteraction?: HostInteractionId | null;
  onUpdate: (updated: IGetListingResponseDto) => void;
}

export function HostInteractionCard({
  listingId,
  hostInteraction,
  onUpdate,
}: HostInteractionCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<string>(hostInteraction ?? "");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const openModal = () => {
    setSelected(hostInteraction ?? "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        { hostInteraction: selected as HostInteractionId },
        { method: "PATCH" },
      );
      onUpdate(updated);
      setModalVisible(false);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const currentLabel = HOST_INTERACTION_OPTIONS.find(
    (opt) => opt.id === hostInteraction,
  )?.label;

  return (
    <>
      <Pressable style={commonStyles.card} onPress={openModal}>
        <Text style={commonStyles.itemTitle}>Interaction with guests</Text>
        <Text style={commonStyles.cardSubtext} numberOfLines={3}>
          {currentLabel ?? "Add details"}
        </Text>
      </Pressable>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={commonStyles.modal}
        >
          <View style={commonStyles.row}>
            <Text style={commonStyles.modalTitle}>Interaction with guests</Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.iconMuted} />
            </Pressable>
          </View>

          <Text style={commonStyles.itemSubtext}>
            Let guests know if you enjoy spending time with them or prefer a
            hands-off approach
          </Text>

          <RadioButton.Group
            onValueChange={(value) => setSelected(value)}
            value={selected}
          >
            {HOST_INTERACTION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={styles.radioRow}
                onPress={() => setSelected(opt.id)}
              >
                <RadioButton value={opt.id} />
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </Pressable>
            ))}
          </RadioButton.Group>

          <ActionBar
            onCancel={() => setModalVisible(false)}
            onSave={handleSave}
            loading={saving}
            saveDisabled={!selected}
          />
        </Modal>
      </Portal>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </>
  );
}

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  radioLabel: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
});
