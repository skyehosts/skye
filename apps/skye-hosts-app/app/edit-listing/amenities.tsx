import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
  ListingAmenityId,
} from "../../../../packages/skye-hosts-api-client/src";
import { LISTING_AMENITY_MAP } from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { handleApiError } from "../utils/form-error-handler";
import { AmenitiesAddModal } from "./amenities-add-modal";

export default function EditAmenitiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
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

  const saveAmenities = async (amenities: ListingAmenityId[]) => {
    if (!listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listing.id}`, { amenities }, { method: "PATCH" });
      setListing(updated);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (amenityId: ListingAmenityId) => {
    if (!listing) return;
    const updated = listing.amenities.filter((a) => a !== amenityId);
    saveAmenities(updated);
  };

  const handleAddModalSave = (amenities: ListingAmenityId[]) => {
    saveAmenities(amenities);
    setAddModalVisible(false);
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Amenities" />
        {editMode ? (
          <Appbar.Action icon="check" onPress={() => setEditMode(false)} />
        ) : (
          <>
            <Appbar.Action icon="pencil" onPress={() => setEditMode(true)} />
            <Appbar.Action
              icon="plus"
              onPress={() => setAddModalVisible(true)}
            />
          </>
        )}
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : editMode ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={commonStyles.sectionTitle}>Remove amenities</Text>
          <Text style={commonStyles.sectionSubtext}>
            Tap the minus icon to remove an amenity.
          </Text>

          <View style={styles.list}>
            {listing?.amenities.map((amenityId) => {
              const meta = LISTING_AMENITY_MAP[amenityId];
              if (!meta) return null;
              return (
                <View key={amenityId} style={styles.editRow}>
                  <Pressable
                    onPress={() => handleRemove(amenityId)}
                    hitSlop={8}
                    disabled={saving}
                  >
                    <Icon
                      source="minus-circle-outline"
                      size={24}
                      color={colors.danger}
                    />
                  </Pressable>
                  <Text style={styles.amenityText}>{meta.title}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={commonStyles.sectionTitle}>Amenities</Text>
          <Text style={commonStyles.sectionSubtext}>
            You&apos;ve added these to your listing so far:
          </Text>

          <View style={styles.list}>
            {listing?.amenities.map((amenityId) => {
              const meta = LISTING_AMENITY_MAP[amenityId];
              if (!meta) return null;
              return (
                <View key={amenityId} style={styles.amenityRow}>
                  <Icon
                    source={meta.icon}
                    size={24}
                    color={colors.iconDecorative}
                  />
                  <Text style={styles.amenityText}>{meta.title}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
      {listing && (
        <AmenitiesAddModal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          selectedAmenities={listing.amenities}
          onSave={handleAddModalSave}
        />
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
    gap: spacing.md,
  },
  list: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  amenityText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
});
