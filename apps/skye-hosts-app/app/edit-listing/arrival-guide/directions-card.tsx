import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { AppSnackbar } from "../../components/app-snackbar";
import { FormInputModal } from "../../components/form-input-modal";
import { fetchApi } from "../../services/api";
import { commonStyles } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

interface DirectionsCardProps {
  listingId: string;
  directions?: string | null;
  onUpdate: (updated: IGetListingResponseDto) => void;
}

export function DirectionsCard({
  listingId,
  directions,
  onUpdate,
}: DirectionsCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSave = async (value: string) => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        { directions: value || null },
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

  return (
    <>
      <Pressable
        style={commonStyles.card}
        onPress={() => setModalVisible(true)}
      >
        <Text style={commonStyles.itemTitle}>Directions</Text>
        <Text style={commonStyles.cardSubtext} numberOfLines={3}>
          {directions ?? "Add details"}
        </Text>
      </Pressable>

      <FormInputModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title="Directions"
        subtext="Let guests know how to get to your place. Include any tips for parking or public transport."
        value={directions ?? ""}
        onSave={handleSave}
        maxLength={500}
        loading={saving}
        optional
      />

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </>
  );
}
