import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  LISTING_AMENITY_MAP,
  LISTING_SPACE_TYPE_LABELS,
  LISTING_TYPE_LABELS,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { FormInputModal } from "../components/form-input-modal";
import { GuestsModal } from "./guests-modal";
import { PropertyTypeModal } from "./property-type-modal";
import { HouseRulesCard } from "./your-space/house-rules-card";
import { fetchApi } from "../services/api";
import { borderRadius, colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface YourSpaceSectionProps {
  listingId: string;
}

export function YourSpaceSection({ listingId }: YourSpaceSectionProps) {
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [guestsModalVisible, setGuestsModalVisible] = useState(false);
  const [propertyTypeModalVisible, setPropertyTypeModalVisible] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

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

  const handleSaveTitle = async (newTitle: string) => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listingId}`, { title: newTitle }, { method: "PATCH" });
      setListing(updated);
      setTitleModalVisible(false);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.editSection}>
        <Text style={commonStyles.sectionTitle}>Your space</Text>
        <Text style={commonStyles.sectionSubtext}>
          Edit the details about your listing space.
        </Text>
        <ActivityIndicator style={commonStyles.sectionLoader} />
      </View>
    );
  }

  return (
    <View style={commonStyles.editSection}>
      <Text style={commonStyles.sectionTitle}>Your space</Text>
      <Text style={commonStyles.sectionSubtext}>
        Edit the details about your listing space.
      </Text>

      <View style={commonStyles.editSectionCards}>
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => router.push("/edit-listing/edit-photos")}
        >
          <Text style={commonStyles.itemTitle}>Photo tour</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext}>
              {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} •{" "}
              {listing.beds} bed{listing.beds !== 1 ? "s" : ""} •{" "}
              {listing.bathrooms} bath
            </Text>
          )}
          <View style={styles.photoPlaceholder} />
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => setTitleModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Title</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext} numberOfLines={2}>
              {listing.title}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => setGuestsModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Number of guests</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext}>
              {listing.maxGuests} guest{listing.maxGuests !== 1 ? "s" : ""}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => router.push("/edit-listing/pricing")}
        >
          <Text style={commonStyles.itemTitle}>Pricing</Text>
          <Text style={commonStyles.itemSubtext}>£120 per night</Text>
          <Text style={commonStyles.itemSubtext}>£120 weekend price</Text>
          <Text style={commonStyles.itemSubtext}>25% weekly discount</Text>
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => router.push("/edit-listing/availability")}
        >
          <Text style={commonStyles.itemTitle}>Availability</Text>
          <Text style={commonStyles.itemSubtext}>2-7 night stays</Text>
          <Text style={commonStyles.itemSubtext}>Same-day advance notice</Text>
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/description",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Description</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext} numberOfLines={4}>
              {listing.description}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => setPropertyTypeModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Property type</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext}>
              {LISTING_SPACE_TYPE_LABELS[listing.spaceType]} {"\u2022"}{" "}
              {LISTING_TYPE_LABELS[listing.typeId]}
            </Text>
          )}
        </Pressable>
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/amenities",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Amenities</Text>
          {listing && listing.amenities.length > 0 && (
            <View style={styles.amenityPreview}>
              {listing.amenities.slice(0, 3).map((id) => {
                const meta = LISTING_AMENITY_MAP[id];
                if (!meta) return null;
                return (
                  <View key={id} style={styles.amenityRow}>
                    <Icon
                      source={meta.icon}
                      size={18}
                      color={colors.textSecondary}
                    />
                    <Text style={commonStyles.itemSubtext}>{meta.title}</Text>
                  </View>
                );
              })}
              {listing.amenities.length > 3 && (
                <Text style={commonStyles.itemSubtext}>
                  + {listing.amenities.length - 3} more
                </Text>
              )}
            </View>
          )}
        </Pressable>

        <HouseRulesCard listingId={listingId} listing={listing} />

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => router.push("/edit-listing/accessibility")}
        >
          <Text style={commonStyles.itemTitle}>Accessibility features</Text>
          <Text style={commonStyles.itemSubtext}>Add details</Text>
        </Pressable>
      </View>

      <FormInputModal
        visible={titleModalVisible}
        onDismiss={() => setTitleModalVisible(false)}
        title="Edit title"
        value={listing?.title ?? ""}
        onSave={handleSaveTitle}
        maxLength={200}
        loading={saving}
      />

      {listing && (
        <GuestsModal
          visible={guestsModalVisible}
          onDismiss={() => setGuestsModalVisible(false)}
          listing={listing}
          onSaved={(updated) => {
            setListing(updated);
            setGuestsModalVisible(false);
          }}
        />
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
      {listing && (
        <PropertyTypeModal
          visible={propertyTypeModalVisible}
          onDismiss={() => setPropertyTypeModalVisible(false)}
          listing={listing}
          onSaved={(updated) => {
            setListing(updated);
            setPropertyTypeModalVisible(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amenityPreview: {
    gap: spacing.sm,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  photoPlaceholder: {
    height: 160,
    backgroundColor: colors.placeholder,
    borderRadius: borderRadius.sm,
  },
});
