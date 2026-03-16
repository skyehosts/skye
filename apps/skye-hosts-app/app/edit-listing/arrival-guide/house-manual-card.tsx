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

interface HouseManualCardProps {
  listingId: string;
  houseManual?: string | null;
  onUpdate: (updated: IGetListingResponseDto) => void;
}

export function HouseManualCard({
  listingId,
  houseManual,
  onUpdate,
}: HouseManualCardProps) {
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
        { houseManual: value || null },
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
        <Text style={commonStyles.itemTitle}>House manual</Text>
        <Text style={commonStyles.cardSubtext} numberOfLines={3}>
          {houseManual ?? "Add details"}
        </Text>
      </Pressable>

      <FormInputModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title="House manual"
        subtext="Give guests tips about your space, like how to access the internet and use the TV."
        value={houseManual ?? ""}
        onSave={handleSave}
        maxLength={1000}
        loading={saving}
        optional
      />

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </>
  );
}
