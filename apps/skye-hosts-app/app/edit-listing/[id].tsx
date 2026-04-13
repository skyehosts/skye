import type {
  IGetHostListingsResponseDto,
  ListingRole,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Appbar, SegmentedButtons } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { spacing } from "../theme";
import { ArrivalGuideSection } from "./arrival-guide-section";
import { BookingsSection } from "./bookings-section";
import { YourSpaceSection } from "./your-space-section";

type Section = "your-space" | "arrival-guide" | "bookings";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [section, setSection] = useState<Section>("bookings");
  const [listingRole, setListingRole] = useState<ListingRole>("owner");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchApi<IGetHostListingsResponseDto>("/listing");
        const found = data.listings.find((l) => l.id === Number(id));
        if (found) setListingRole(found.role);
      } catch {
        // Non-critical
      }
    })();
  }, [id]);

  const canManageCoHosts =
    listingRole === "owner" || listingRole === "full_access";

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Listing editor" />
        {listingRole === "owner" && (
          <Appbar.Action
            icon="cog"
            onPress={() =>
              router.push({
                pathname: "/edit-listing/listing-settings",
                params: { id },
              })
            }
          />
        )}
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SegmentedButtons
          value={section}
          onValueChange={(value) => setSection(value as Section)}
          buttons={[
            { value: "bookings", label: "Bookings" },
            { value: "your-space", label: "Your space" },
            { value: "arrival-guide", label: "Arrival guide" },
          ]}
          style={styles.segmentedButtons}
        />

        {section === "your-space" && <YourSpaceSection listingId={id} />}
        {section === "arrival-guide" && <ArrivalGuideSection listingId={id} />}
        {section === "bookings" && (
          <BookingsSection listingId={id} canManageCoHosts={canManageCoHosts} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  segmentedButtons: {
    marginBottom: spacing.lg,
  },
});
