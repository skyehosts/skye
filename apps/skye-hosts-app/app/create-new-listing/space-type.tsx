import type {
  IGetSpaceTypesResponseDto,
  IListingSpaceTypeDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { ListingSpaceType } from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Icon } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "../theme";
import { useCreateListing } from "./context";

const ICON_MAP: Record<ListingSpaceType, string> = {
  [ListingSpaceType.EntirePlace]: "home-outline",
  [ListingSpaceType.Room]: "door-open",
  [ListingSpaceType.SharedRoom]: "bunk-bed-outline",
};

export default function SpaceTypeScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [types, setTypes] = useState<IListingSpaceTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<ListingSpaceType | null>(null);

  useEffect(() => {
    if (draft.spaceType) setSelectedId(draft.spaceType);
  }, [draft.spaceType]);

  const loadTypes = useCallback(async () => {
    try {
      const data = await fetchApi<IGetSpaceTypesResponseDto>(
        "/listing/space-types",
      );
      setTypes(data.types);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  return (
    <ScreenContainer>
      <WizardAppBar title="Tell us about your place" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[commonStyles.heading, { marginBottom: spacing.lg }]}>
          What type of place will guests have?
        </Text>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View style={styles.cards}>
            {types.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.card, isSelected && commonStyles.cardSelected]}
                  onPress={() => setSelectedId(item.id)}
                >
                  <View style={styles.cardText}>
                    <Text
                      style={[
                        commonStyles.cardTitle,
                        isSelected && commonStyles.cardTitleSelected,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.cardDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <Icon
                    source={ICON_MAP[item.id] ?? "help-circle-outline"}
                    size={32}
                    color={isSelected ? colors.primary : colors.iconDecorative}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!selectedId}
          onPress={() => {
            if (selectedId) setDraftField("spaceType", selectedId);
            router.push("/create-new-listing/location");
          }}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
});
