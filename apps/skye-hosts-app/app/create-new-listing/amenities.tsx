import type {
  IGetAmenitiesResponseDto,
  IListingAmenityCategoryDto,
  ListingAmenityId,
} from "../../../../packages/skye-hosts-api-client/src";
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
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { useCreateListing } from "./context";

interface CategoryGroup {
  title: string;
  items: SelectionCardItem[];
}

export default function AmenitiesScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (draft.amenities) setSelectedIds(draft.amenities);
  }, [draft.amenities]);

  const loadAmenities = useCallback(async () => {
    try {
      const data =
        await fetchApi<IGetAmenitiesResponseDto>("/listing/amenities");
      setCategories(
        data.categories.map((cat: IListingAmenityCategoryDto) => ({
          title: cat.title,
          items: cat.amenities.map((a) => ({
            id: a.id,
            title: a.title,
            icon: a.icon,
          })),
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAmenities();
  }, [loadAmenities]);

  const handleToggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <ScreenContainer>
      <WizardAppBar title="Make it stand out" />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={commonStyles.contentScroll}>
          <Text style={[commonStyles.heading, { marginBottom: 0 }]}>
            Tell guests what your place has to offer
          </Text>
          <Text style={[commonStyles.subheading, { marginBottom: 0 }]}>
            You can add more amenities after you publish your listing.
          </Text>

          {categories.map((cat) => (
            <View key={cat.title}>
              <Text style={styles.sectionTitle}>{cat.title}</Text>
              <SelectionCardGrid
                items={cat.items}
                selectedIds={selectedIds}
                onToggle={handleToggle}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            setDraftField("amenities", selectedIds as ListingAmenityId[]);
            router.push("/create-new-listing/title");
          }}
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
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
});
