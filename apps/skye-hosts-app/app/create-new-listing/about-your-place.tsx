import type { IGetAccommodationTypesResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { ListingTypeId } from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import type { SelectionCardItem } from "../components/selection-card-grid";
import { SelectionCardGrid } from "../components/selection-card-grid";
import { ScreenContainer } from "../components/screen-container";
import { useCreateListing } from "./context";
import { fetchApi } from "../services/api";
import { commonStyles, spacing } from "../theme";

const ICON_MAP: Record<ListingTypeId, string> = {
  [ListingTypeId.House]: "home-outline",
  [ListingTypeId.FlatApartment]: "office-building-outline",
  [ListingTypeId.Barn]: "barn",
  [ListingTypeId.BedAndBreakfast]: "bed-outline",
  [ListingTypeId.Cabin]: "pine-tree",
  [ListingTypeId.CampervanMotorhome]: "rv-truck",
  [ListingTypeId.Farm]: "tractor",
  [ListingTypeId.GuestHouse]: "home-city-outline",
  [ListingTypeId.Hotel]: "domain",
  [ListingTypeId.Houseboat]: "sail-boat",
  [ListingTypeId.ShepherdsHut]: "greenhouse",
  [ListingTypeId.Tent]: "tent",
  [ListingTypeId.TinyHome]: "home-minus-outline",
  [ListingTypeId.TreeHouse]: "tree-outline",
  [ListingTypeId.Yurt]: "yurt",
};

export default function AboutYourPlaceScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [items, setItems] = useState<SelectionCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (draft.typeId) setSelectedId(draft.typeId);
  }, [draft.typeId]);

  const loadTypes = useCallback(async () => {
    try {
      const data = await fetchApi<IGetAccommodationTypesResponseDto>(
        "/listing/accommodation-types",
      );
      setItems(
        data.types.map((t) => ({
          id: t.id,
          title: t.title,
          icon: ICON_MAP[t.id] ?? "help-circle-outline",
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const handleToggle = (id: string) => {
    setSelectedId(id);
    const title = items.find((item) => item.id === id)?.title;
    setDraftField("typeId", id as ListingTypeId);
    setDraftField("typeName", title);
  };

  return (
    <ScreenContainer>
      <WizardAppBar title="Tell us about your place" />

      <ScrollView contentContainerStyle={commonStyles.contentScroll}>
        <Text style={[commonStyles.heading, { marginBottom: spacing.lg }]}>
          Which of these best describes your place?
        </Text>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <SelectionCardGrid
            items={items}
            selectedIds={selectedId ? [selectedId] : []}
            onToggle={handleToggle}
          />
        )}
      </ScrollView>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!selectedId}
          onPress={() => router.push("/create-new-listing/space-type")}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
