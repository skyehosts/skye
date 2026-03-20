import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
  ListingStatus,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ListingStatusModal } from "../components/listing-status-modal";
import { ListingStatusRow } from "../components/listing-status-row";
import { ShortTermLetModal } from "../components/short-term-let-modal";
import { ShortTermLetRow } from "../components/short-term-let-row";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

export default function EditListingPreferencesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [stlModalVisible, setStlModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
      setListing(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const patchListing = async (
    body: IUpdateListingRequestDto,
    onSuccess: () => void,
  ) => {
    if (!listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listing.id}`, body, { method: "PATCH" });
      setListing(updated);
      onSuccess();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusSave = (status: ListingStatus) =>
    patchListing({ status }, () => setStatusModalVisible(false));

  const handleStlSave = (shortTermLetLicenseConfirmed: boolean) =>
    patchListing({ shortTermLetLicenseConfirmed }, () =>
      setStlModalVisible(false),
    );

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit listing preferences" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={commonStyles.borderedRows}>
            <ListingStatusRow
              status={listing?.status ?? "draft"}
              onPress={() => setStatusModalVisible(true)}
            />
            <View style={commonStyles.borderedRowDivider} />
            <ShortTermLetRow onPress={() => setStlModalVisible(true)} />
          </View>
        </ScrollView>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />

      {listing && (
        <>
          <ListingStatusModal
            visible={statusModalVisible}
            onDismiss={() => setStatusModalVisible(false)}
            currentStatus={listing.status}
            shortTermLetLicenseConfirmed={listing.shortTermLetLicenseConfirmed}
            onSave={handleStatusSave}
            loading={saving}
          />
          <ShortTermLetModal
            visible={stlModalVisible}
            onDismiss={() => setStlModalVisible(false)}
            confirmed={listing.shortTermLetLicenseConfirmed}
            onSave={handleStlSave}
            loading={saving}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
});
