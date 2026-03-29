import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
  ICalendarSyncDto,
  IGetCalendarSyncsResponseDto,
  ListingStatus,
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
import { AppSnackbar } from "../components/app-snackbar";
import { ListingStatusModal } from "../components/listing-status-modal";
import { ListingStatusRow } from "../components/listing-status-row";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";
import { Icon } from "react-native-paper";
import {
  PLATFORM_LABELS,
  getAggregateSyncDirection,
  getSyncDirection,
} from "../utils/sync-status";

function formatNightsCardText(listing: IGetListingResponseDto): string {
  const minDisplay = listing.minNightsByCheckInDay
    ? `${Math.min(...Object.values(listing.minNightsByCheckInDay))}–${Math.max(...Object.values(listing.minNightsByCheckInDay))}`
    : `${listing.minNights}`;
  return listing.maxNights
    ? `${minDisplay}–${listing.maxNights} night stays`
    : `${minDisplay}+ night stays`;
}

interface BookingsSectionProps {
  listingId: string;
  canManageCoHosts: boolean;
}

export function BookingsSection({
  listingId,
  canManageCoHosts,
}: BookingsSectionProps) {
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [syncs, setSyncs] = useState<ICalendarSyncDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [listingData, syncsData] = await Promise.allSettled([
        fetchApi<IGetListingResponseDto>(`/listing/${listingId}/edit`),
        fetchApi<IGetCalendarSyncsResponseDto>(
          `/calendar-sync/listing/${listingId}`,
          undefined,
          { method: "GET" },
        ),
      ]);
      if (listingData.status === "fulfilled") setListing(listingData.value);
      if (syncsData.status === "fulfilled") setSyncs(syncsData.value.syncs);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleStatusSave = async (status: ListingStatus) => {
    if (!listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listing.id}`, { status }, { method: "PATCH" });
      setListing(updated);
      setStatusModalVisible(false);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.editSection}>
        <Text style={commonStyles.sectionTitle}>Bookings</Text>
        <Text style={commonStyles.sectionSubtext}>
          Manage pricing, availability, and how your listing is booked.
        </Text>
        <ActivityIndicator style={commonStyles.sectionLoader} />
      </View>
    );
  }

  return (
    <View style={commonStyles.editSection}>
      <Text style={commonStyles.sectionTitle}>Bookings</Text>
      <Text style={commonStyles.sectionSubtext}>
        Manage pricing, availability, and how your listing is booked.
      </Text>

      <View style={commonStyles.editSectionCards}>
        {/* Listing status */}
        <View style={commonStyles.borderedRows}>
          <ListingStatusRow
            status={listing?.status ?? "draft"}
            onPress={() => setStatusModalVisible(true)}
          />
        </View>

        {/* Pricing */}
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() => router.push("/edit-listing/pricing")}
        >
          <Text style={commonStyles.itemTitle}>Pricing</Text>
          <Text style={commonStyles.itemSubtext}>£120 per night</Text>
          <Text style={commonStyles.itemSubtext}>£120 weekend price</Text>
          <Text style={commonStyles.itemSubtext}>25% weekly discount</Text>
        </Pressable>

        {/* Availability */}
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/availability",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Availability</Text>
          <Text style={commonStyles.itemSubtext}>
            {listing ? formatNightsCardText(listing) : "Loading..."}
          </Text>
          <Text style={commonStyles.itemSubtext}>Same-day advance notice</Text>
        </Pressable>

        {/* Calendar sync */}
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/calendar-sync",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Calendar sync</Text>
          {syncs.length === 0 ? (
            <Text style={commonStyles.itemSubtext}>
              Sync with AirBnB or Booking.com to avoid double bookings
            </Text>
          ) : (
            <>
              {syncs.map((s) => (
                <View key={s.id} style={styles.syncConnectedRow}>
                  <View
                    style={[
                      styles.syncDot,
                      {
                        backgroundColor:
                          getSyncDirection(s) === "none"
                            ? colors.danger
                            : colors.success,
                      },
                    ]}
                  />
                  <Text style={commonStyles.itemSubtext}>
                    {PLATFORM_LABELS[s.platform] ?? s.platform} connected
                  </Text>
                </View>
              ))}
              {getAggregateSyncDirection(syncs) === "one-way" && (
                <View style={styles.syncConnectedRow}>
                  <Icon
                    source="alert-outline"
                    size={16}
                    color={colors.warning}
                  />
                  <Text style={styles.oneWayHint}>
                    Enable import and export for full protection
                  </Text>
                </View>
              )}
            </>
          )}
        </Pressable>

        {/* Co-Hosts */}
        {canManageCoHosts && (
          <Pressable
            style={[commonStyles.card, { gap: spacing.sm }]}
            onPress={() =>
              router.push({
                pathname: "/co-host/manage",
                params: { listingId },
              })
            }
          >
            <Text style={commonStyles.itemTitle}>Co-Hosts</Text>
            <Text style={commonStyles.itemSubtext}>
              Manage who has access to this listing
            </Text>
          </Pressable>
        )}
      </View>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />

      {listing && (
        <ListingStatusModal
          visible={statusModalVisible}
          onDismiss={() => setStatusModalVisible(false)}
          currentStatus={listing.status}
          shortTermLetLicenseConfirmed={listing.shortTermLetLicenseConfirmed}
          onSave={handleStatusSave}
          loading={saving}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  syncConnectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  oneWayHint: {
    fontSize: typography.sm,
    color: colors.warning,
  },
});
