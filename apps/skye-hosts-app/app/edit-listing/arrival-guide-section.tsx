import type { IGetListingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { fetchApi } from "../services/api";
import { commonStyles } from "../theme";
import { CheckInCheckoutCard } from "./arrival-guide/check-in-checkout-card";
import { DirectionsCard } from "./arrival-guide/directions-card";
import { CheckoutInstructionsCard } from "./arrival-guide/checkout-instructions-card";
import { HostInteractionCard } from "./arrival-guide/host-interaction-card";
import { HouseManualCard } from "./arrival-guide/house-manual-card";
import { WifiDetailsCard } from "./arrival-guide/wifi-details-card";

interface ArrivalGuideSectionProps {
  listingId: string;
}

export function ArrivalGuideSection({ listingId }: ArrivalGuideSectionProps) {
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={commonStyles.editSection}>
      <Text style={commonStyles.sectionTitle}>Arrival guide</Text>
      <Text style={commonStyles.sectionSubtext}>
        Help guests know when to arrive and depart.
      </Text>

      <View style={commonStyles.editSectionCards}>
        <CheckInCheckoutCard
          listingId={listingId}
          checkInTimeStart={listing?.checkInTimeStart}
          checkInTimeEnd={listing?.checkInTimeEnd}
          checkOutTime={listing?.checkOutTime}
          onUpdate={setListing}
        />

        <DirectionsCard
          listingId={listingId}
          directions={listing?.directions}
          onUpdate={setListing}
        />

        <WifiDetailsCard
          listingId={listingId}
          wifiNetwork={listing?.wifiNetwork}
          wifiPassword={listing?.wifiPassword}
          onUpdate={setListing}
        />

        <HouseManualCard
          listingId={listingId}
          houseManual={listing?.houseManual}
          onUpdate={setListing}
        />

        <CheckoutInstructionsCard listingId={listingId} listing={listing} />

        <HostInteractionCard
          listingId={listingId}
          hostInteraction={listing?.hostInteraction}
          onUpdate={setListing}
        />
      </View>
    </View>
  );
}
