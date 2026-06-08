import {
  formatGbp,
  type IGetListingPricingResponseDto,
  type IListingSeasonPricingDto,
  type PricingSeasonId,
} from "@repo/common";
import {
  type IGetListingResponseDto,
  type IUpdateListingRequestDto,
  type ICalendarSyncDto,
  type IGetCalendarSyncsResponseDto,
  type ListingStatus,
  CANCELLATION_POLICY_SHORT_TERM_LABELS,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AppSnackbar } from "../components/app-snackbar";
import { CalendarSyncSummaryCard } from "../components/calendar-sync-summary-card";
import { ListingStatusModal } from "../components/listing-status-modal";
import { ListingStatusRow } from "../components/listing-status-row";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

const SEASON_SHORT_LABEL: Record<PricingSeasonId, string> = {
  peak: "Peak",
  shoulder: "Shoulder",
  low: "Low",
};

function formatPriceLine(seasons: IListingSeasonPricingDto[]): string | null {
  const complete = seasons.filter(
    (s) => s.weekdayPricePence > 0 && s.weekendPricePence > 0,
  );
  if (complete.length === 0) return null;
  const order: PricingSeasonId[] = ["peak", "shoulder", "low"];
  return order
    .map((s) => {
      const data = complete.find((x) => x.season === s);
      if (!data) return null;
      return `${SEASON_SHORT_LABEL[s]} ${formatGbp(data.weekdayPricePence)}`;
    })
    .filter(Boolean)
    .join(" · ");
}

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
  const [pricing, setPricing] = useState<IGetListingPricingResponseDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [listingData, syncsData, pricingData] = await Promise.allSettled([
        fetchApi<IGetListingResponseDto>(`/listing/${listingId}/edit`),
        fetchApi<IGetCalendarSyncsResponseDto>(
          `/calendar-sync/listing/${listingId}`,
          undefined,
          { method: "GET" },
        ),
        fetchApi<IGetListingPricingResponseDto>(
          `/listing/${listingId}/pricing`,
          undefined,
          { method: "GET" },
        ),
      ]);
      if (listingData.status === "fulfilled") setListing(listingData.value);
      if (syncsData.status === "fulfilled") setSyncs(syncsData.value.syncs);
      if (pricingData.status === "fulfilled") setPricing(pricingData.value);
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
          onPress={() =>
            router.push({
              pathname: "/edit-listing/pricing",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Pricing</Text>
          {(() => {
            if (!pricing) {
              return (
                <Text style={commonStyles.itemSubtext}>Enter details</Text>
              );
            }
            const priceLine = formatPriceLine(pricing.seasons);
            const discounts: string[] = [];
            if (pricing.globals.lastMinuteEnabled)
              discounts.push(
                `Last-minute ${pricing.globals.lastMinutePercent}% off`,
              );
            if (pricing.globals.weeklyEnabled)
              discounts.push(`Weekly ${pricing.globals.weeklyPercent}% off`);
            if (pricing.globals.monthlyEnabled)
              discounts.push(`Monthly ${pricing.globals.monthlyPercent}% off`);
            return (
              <>
                <Text style={commonStyles.itemSubtext}>
                  {priceLine ?? "Enter details"}
                </Text>
                {discounts.length > 0 && (
                  <Text style={commonStyles.itemSubtext}>
                    {discounts.join(" · ")}
                  </Text>
                )}
                {!pricing.isComplete && listing?.status !== "active" && (
                  <Text
                    style={[
                      commonStyles.itemSubtext,
                      { color: colors.warning },
                    ]}
                  >
                    Required to publish
                  </Text>
                )}
              </>
            );
          })()}
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
        <CalendarSyncSummaryCard
          syncs={syncs}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/calendar-sync",
              params: { id: listingId },
            })
          }
        />

        {/* Cancellation policy */}
        <Pressable
          style={[commonStyles.card, { gap: spacing.sm }]}
          onPress={() =>
            router.push({
              pathname: "/edit-listing/cancellation-policy",
              params: { id: listingId },
            })
          }
        >
          <Text style={commonStyles.itemTitle}>Cancellation Policy</Text>
          <Text style={commonStyles.itemSubtext}>
            {listing?.cancellationPolicyShortTerm
              ? CANCELLATION_POLICY_SHORT_TERM_LABELS[
                  listing.cancellationPolicyShortTerm
                ]
              : "Add details"}
          </Text>
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
