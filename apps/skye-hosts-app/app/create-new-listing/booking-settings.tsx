import {
  ListingBookingType,
  LISTING_BOOKING_TYPE_OPTIONS,
} from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Icon } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "../theme";
import { useCreateListing } from "./context";

export default function BookingSettingsScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [selectedId, setSelectedId] = useState<ListingBookingType | null>(null);

  useEffect(() => {
    if (draft.bookingType) setSelectedId(draft.bookingType);
  }, [draft.bookingType]);

  return (
    <ScreenContainer>
      <WizardAppBar title="Finish up and publish" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>Pick your booking settings</Text>
        <Text style={commonStyles.subheading}>
          You can change this at any time, learn more.
        </Text>

        <View style={styles.cards}>
          {LISTING_BOOKING_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.card, isSelected && commonStyles.cardSelected]}
                onPress={() => setSelectedId(option.id)}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && commonStyles.cardTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Icon
                    source={option.icon}
                    size={24}
                    color={isSelected ? colors.primary : colors.iconDecorative}
                  />
                </View>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!selectedId}
          onPress={() => {
            if (selectedId) setDraftField("bookingType", selectedId);
            router.push("/create-new-listing/pricing");
          }}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    paddingRight: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
});
