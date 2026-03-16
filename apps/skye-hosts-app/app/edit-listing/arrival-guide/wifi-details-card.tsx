import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { AppSnackbar } from "../../components/app-snackbar";
import { WifiDetailsModal } from "../../components/wifi-details-modal";
import { fetchApi } from "../../services/api";
import { commonStyles } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

interface WifiDetailsCardProps {
  listingId: string;
  wifiNetwork?: string | null;
  wifiPassword?: string | null;
  onUpdate: (updated: IGetListingResponseDto) => void;
}

export function WifiDetailsCard({
  listingId,
  wifiNetwork,
  wifiPassword,
  onUpdate,
}: WifiDetailsCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSave = async (network: string, password: string) => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        { wifiNetwork: network || null, wifiPassword: password || null },
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
        <Text style={commonStyles.itemTitle}>Wi-Fi details</Text>
        <Text style={commonStyles.itemSubtext}>
          {wifiNetwork ?? "Add details"}
        </Text>
      </Pressable>

      <WifiDetailsModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        network={wifiNetwork ?? ""}
        password={wifiPassword ?? ""}
        onSave={handleSave}
        loading={saving}
      />

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </>
  );
}
