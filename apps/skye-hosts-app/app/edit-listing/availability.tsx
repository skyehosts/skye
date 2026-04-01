import type { IGetListingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { SettingsListItem } from "../components/settings-list-item";
import { fetchApi } from "../services/api";
import { commonStyles } from "../theme";
import { MaxNightsModal } from "./max-nights-modal";
import { MinNightsModal } from "./min-nights-modal";
import { useFocusEffect } from "expo-router";

function formatMinNightsDescription(listing: IGetListingResponseDto): string {
  if (listing.minNightsByCheckInDay) {
    const values = Object.values(listing.minNightsByCheckInDay);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max
      ? `${min} night${min !== 1 ? "s" : ""} (custom by day)`
      : `${min}–${max} nights (custom by day)`;
  }
  return listing.minNights === 1 ? "1 night" : `${listing.minNights} nights`;
}

function formatMaxNightsDescription(listing: IGetListingResponseDto): string {
  if (listing.maxNights === null) {
    return "No limit set";
  }
  return `${listing.maxNights} night${listing.maxNights !== 1 ? "s" : ""}`;
}

export default function AvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [minNightsModalVisible, setMinNightsModalVisible] = useState(false);
  const [maxNightsModalVisible, setMaxNightsModalVisible] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(
        `/listing/${id}/edit`,
      );
      setListing(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchListing();
    }, [fetchListing]),
  );

  const handleSaved = (updated: IGetListingResponseDto) => {
    setListing(updated);
    setMinNightsModalVisible(false);
    setMaxNightsModalVisible(false);
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Availability" />
      </Appbar.Header>

      {loading || !listing ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <>
          <ScrollView>
            <View style={commonStyles.menuSection}>
              <SettingsListItem
                icon="weather-night"
                label="Minimum nights"
                description={formatMinNightsDescription(listing)}
                onPress={() => setMinNightsModalVisible(true)}
                actionText="Edit"
              />
              <SettingsListItem
                icon="moon-waning-crescent"
                label="Maximum nights"
                description={formatMaxNightsDescription(listing)}
                onPress={() => setMaxNightsModalVisible(true)}
                actionText="Edit"
              />
            </View>
          </ScrollView>

          <MinNightsModal
            visible={minNightsModalVisible}
            onDismiss={() => setMinNightsModalVisible(false)}
            listing={listing}
            onSaved={handleSaved}
          />

          <MaxNightsModal
            visible={maxNightsModalVisible}
            onDismiss={() => setMaxNightsModalVisible(false)}
            listing={listing}
            onSaved={handleSaved}
          />
        </>
      )}
    </ScreenContainer>
  );
}
