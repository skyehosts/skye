import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppSnackbar } from "../components/app-snackbar";
import { DropdownField } from "../components/dropdown-field";
import { FormInputModal } from "../components/form-input-modal";
import { WifiDetailsModal } from "../components/wifi-details-modal";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing } from "../theme";
import { handleFormError } from "../utils/form-error-handler";

interface ArrivalGuideSectionProps {
  listingId: string;
}

function generateTimeOptions(): { value: string; label: string }[] {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const value = `${hh}:${mm}`;
      times.push({ value, label: value });
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();
const DEFAULT_TIME = "12:00";

export function ArrivalGuideSection({ listingId }: ArrivalGuideSectionProps) {
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [wifiModalVisible, setWifiModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [checkInStart, setCheckInStart] = useState<string>(DEFAULT_TIME);
  const [checkInEnd, setCheckInEnd] = useState<string>(DEFAULT_TIME);
  const [checkOut, setCheckOut] = useState<string>(DEFAULT_TIME);

  const { setError } = useForm();

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(
        `/listing/${listingId}`,
      );
      setListing(data);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useFocusEffect(
    useCallback(() => {
      fetchListing();
    }, [fetchListing]),
  );

  useEffect(() => {
    if (modalVisible && listing) {
      setCheckInStart(listing.checkInTimeStart ?? DEFAULT_TIME);
      setCheckInEnd(listing.checkInTimeEnd ?? DEFAULT_TIME);
      setCheckOut(listing.checkOutTime ?? DEFAULT_TIME);
    }
  }, [modalVisible, listing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        {
          checkInTimeStart: checkInStart,
          checkInTimeEnd: checkInEnd,
          checkOutTime: checkOut,
        },
        { method: "PATCH" },
      );
      setListing(updated);
      setModalVisible(false);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDirections = async (value: string) => {
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
      setListing(updated);
      setDirectionsModalVisible(false);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWifi = async (network: string, password: string) => {
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
      setListing(updated);
      setWifiModalVisible(false);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.editSection}>
        <Text style={commonStyles.sectionTitle}>Arrival guide</Text>
        <Text style={commonStyles.sectionSubtext}>
          Help guests know when to arrive and depart.
        </Text>
        <ActivityIndicator style={commonStyles.sectionLoader} />
      </View>
    );
  }

  const checkInDisplay =
    listing?.checkInTimeStart && listing?.checkInTimeEnd
      ? `${listing.checkInTimeStart} – ${listing.checkInTimeEnd}`
      : "Not set";

  const checkOutDisplay = listing?.checkOutTime ?? "Not set";

  const directionsDisplay = listing?.directions ? listing.directions : null;

  const wifiDisplay = listing?.wifiNetwork ?? null;

  return (
    <View style={commonStyles.editSection}>
      <Text style={commonStyles.sectionTitle}>Arrival guide</Text>
      <Text style={commonStyles.sectionSubtext}>
        Help guests know when to arrive and depart.
      </Text>

      <View style={commonStyles.editSectionCards}>
        <Pressable
          style={[commonStyles.card, styles.splitCard]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.splitSide}>
            <Text style={commonStyles.itemTitle}>Check-in</Text>
            <Text style={commonStyles.itemSubtext}>{checkInDisplay}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.splitSide}>
            <Text style={commonStyles.itemTitle}>Checkout</Text>
            <Text style={commonStyles.itemSubtext}>{checkOutDisplay}</Text>
          </View>
        </Pressable>

        <Pressable
          style={commonStyles.card}
          onPress={() => setDirectionsModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Directions</Text>
          <Text
            style={[commonStyles.itemSubtext, styles.directionsSubtext]}
            numberOfLines={3}
          >
            {directionsDisplay ?? "Add details"}
          </Text>
        </Pressable>

        <Pressable
          style={commonStyles.card}
          onPress={() => setWifiModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Wi-Fi details</Text>
          <Text style={commonStyles.itemSubtext}>
            {wifiDisplay ?? "Add details"}
          </Text>
        </Pressable>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={commonStyles.modal}
        >
          <View style={commonStyles.row}>
            <Text style={commonStyles.modalTitle}>
              Check-in & checkout times
            </Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={commonStyles.itemTitle}>Check-in window</Text>
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownHalf}>
              <DropdownField
                label="Start time"
                value={checkInStart}
                options={TIME_OPTIONS}
                onChange={setCheckInStart}
              />
            </View>
            <View style={styles.dropdownHalf}>
              <DropdownField
                label="End time"
                value={checkInEnd}
                options={TIME_OPTIONS}
                onChange={setCheckInEnd}
              />
            </View>
          </View>

          <Text style={commonStyles.itemTitle}>Checkout time</Text>
          <DropdownField
            label="Select time"
            value={checkOut}
            options={TIME_OPTIONS}
            onChange={setCheckOut}
          />

          <View style={commonStyles.divider} />

          <View style={commonStyles.row}>
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
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
      <FormInputModal
        visible={directionsModalVisible}
        onDismiss={() => setDirectionsModalVisible(false)}
        title="Directions"
        subtext="Let guests know how to get to your place. Include any tips for parking or public transport."
        value={listing?.directions ?? ""}
        onSave={handleSaveDirections}
        maxLength={500}
        loading={saving}
        optional
      />
      <WifiDetailsModal
        visible={wifiModalVisible}
        onDismiss={() => setWifiModalVisible(false)}
        network={listing?.wifiNetwork ?? ""}
        password={listing?.wifiPassword ?? ""}
        onSave={handleSaveWifi}
        loading={saving}
      />
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </View>
  );
}

const styles = StyleSheet.create({
  splitCard: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  splitSide: {
    flex: 1,
    gap: spacing.xs,
  },
  separator: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  dropdownRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dropdownHalf: {
    flex: 1,
  },
  directionsSubtext: {
    marginTop: spacing.xs,
  },
});
