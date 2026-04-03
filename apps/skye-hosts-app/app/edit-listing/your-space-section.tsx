import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  ACCESSIBILITY_FEATURES_CONFIG,
  type ITriStateItemConfig,
  LISTING_AMENITY_MAP,
  LISTING_SPACE_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  SAFETY_CONSIDERATIONS_CONFIG,
  SAFETY_DEVICES_CONFIG,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { SafetyConsiderationsModal } from "./safety-considerations-modal";
import { SafetyDevicesModal } from "./safety-devices-modal";
import { fetchApi } from "../services/api";
import { borderRadius, colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

function TriStateCardPreview({
  entries,
  config,
}: {
  entries: string[];
  config: readonly ITriStateItemConfig[];
}) {
  const yesEntries = entries
    .filter((e) => e.endsWith(":yes"))
    .map((e) => e.split(":")[0]);
  if (yesEntries.length === 0) {
    return <Text style={commonStyles.itemSubtext}>Add details</Text>;
  }
  return (
    <View style={styles.amenityPreview}>
      {yesEntries.slice(0, 3).map((id) => {
        const item = config.find((c) => c.id === id);
        if (!item) return null;
        return (
          <View key={id} style={styles.amenityRow}>
            <Icon source={item.icon} size={18} color={colors.iconDecorative} />
            <Text style={commonStyles.itemSubtext}>{item.title}</Text>
          </View>
        );
      })}
      {yesEntries.length > 3 && (
        <Text style={commonStyles.itemSubtext}>
          + {yesEntries.length - 3} more
        </Text>
      )}
    </View>
  );
}

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
  const [
    safetyConsiderationsModalVisible,
    setSafetyConsiderationsModalVisible,
  ] = useState(false);
  const [safetyDevicesModalVisible, setSafetyDevicesModalVisible] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(
        `/listing/${listingId}/edit`,
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
          onPress={() =>
            router.push({
              pathname: "/edit-listing/edit-photos",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Photo tour</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext}>
              {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} •{" "}
              {listing.beds} bed{listing.beds !== 1 ? "s" : ""} •{" "}
              {listing.bathrooms} bath
            </Text>
          )}
          <View style={styles.photoPlaceholder}>
            {listing?.coverImageUrl && (
              <Image
                source={{ uri: listing.coverImageUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
          </View>
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
          onPress={() =>
            router.push({
              pathname: "/edit-listing/edit-location",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Location</Text>
          {listing && (
            <Text style={commonStyles.itemSubtext}>
              {listing.postCode}
              {listing.latitude != null
                ? " \u2022 Pin placed"
                : " \u2022 No pin set"}
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
                      color={colors.iconDecorative}
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
          onPress={() =>
            router.push({
              pathname: "/edit-listing/accessibility",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Accessibility features</Text>
          {listing &&
            (listing.accessibilityFeatures?.length > 0 ? (
              <View style={styles.amenityPreview}>
                {listing.accessibilityFeatures.slice(0, 3).map((id) => {
                  const feature = ACCESSIBILITY_FEATURES_CONFIG.find(
                    (f) => f.id === id,
                  );
                  if (!feature) return null;
                  return (
                    <View key={id} style={styles.amenityRow}>
                      <Icon
                        source={feature.icon}
                        size={18}
                        color={colors.iconDecorative}
                      />
                      <Text style={commonStyles.itemSubtext}>
                        {feature.title}
                      </Text>
                    </View>
                  );
                })}
                {listing.accessibilityFeatures.length > 3 && (
                  <Text style={commonStyles.itemSubtext}>
                    + {listing.accessibilityFeatures.length - 3} more
                  </Text>
                )}
              </View>
            ) : (
              <Text style={commonStyles.itemSubtext}>Add details</Text>
            ))}
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => setSafetyConsiderationsModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Safety considerations</Text>
          {listing && (
            <TriStateCardPreview
              entries={listing.safetyConsiderations ?? []}
              config={SAFETY_CONSIDERATIONS_CONFIG}
            />
          )}
        </Pressable>

        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => setSafetyDevicesModalVisible(true)}
        >
          <Text style={commonStyles.itemTitle}>Safety devices</Text>
          {listing && (
            <TriStateCardPreview
              entries={listing.safetyDevices ?? []}
              config={SAFETY_DEVICES_CONFIG}
            />
          )}
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
      {listing && (
        <SafetyConsiderationsModal
          visible={safetyConsiderationsModalVisible}
          onDismiss={() => setSafetyConsiderationsModalVisible(false)}
          listing={listing}
          onSaved={(updated) => {
            setListing(updated);
            setSafetyConsiderationsModalVisible(false);
          }}
        />
      )}
      {listing && (
        <SafetyDevicesModal
          visible={safetyDevicesModalVisible}
          onDismiss={() => setSafetyDevicesModalVisible(false)}
          listing={listing}
          onSaved={(updated) => {
            setListing(updated);
            setSafetyDevicesModalVisible(false);
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
    overflow: "hidden",
  },
});
