import type { ICreateListingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import {
  ListingSafetyDisclosureId,
  LISTING_SAFETY_DISCLOSURE_LABELS,
} from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, Checkbox } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { handleFormError } from "../utils/form-error-handler";
import { useCreateListing } from "./context";
import { APP_DISPLAY_NAME } from "@repo/common";

const APP_NAME = APP_DISPLAY_NAME;

const DISCLOSURES = Object.values(ListingSafetyDisclosureId).map((id) => ({
  id,
  label: LISTING_SAFETY_DISCLOSURE_LABELS[id],
}));

interface SafetyDetailsFormValues {
  safetyDisclosures: ListingSafetyDisclosureId[];
}

export default function SafetyDetailsScreen() {
  const router = useRouter();
  const { draft, setDraftField, clearDraft } = useCreateListing();
  const [checked, setChecked] = useState<ListingSafetyDisclosureId[]>([]);

  const {
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SafetyDetailsFormValues>({
    defaultValues: { safetyDisclosures: [] },
  });

  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (draft.safetyDisclosures) setChecked(draft.safetyDisclosures);
  }, [draft.safetyDisclosures]);

  const toggle = (id: ListingSafetyDisclosureId) => {
    const next = checked.includes(id)
      ? checked.filter((x) => x !== id)
      : [...checked, id];
    setChecked(next);
    setDraftField("safetyDisclosures", next);
  };

  const onSubmit = async () => {
    setServerError("");

    if (
      !draft.typeId ||
      !draft.spaceType ||
      !draft.postCode ||
      !draft.title ||
      !draft.description ||
      !draft.bookingType
    ) {
      Alert.alert("Missing data", "Please complete all previous steps first.");
      return;
    }

    try {
      const result = await fetchApi<ICreateListingResponseDto>("/listing", {
        typeId: draft.typeId,
        spaceType: draft.spaceType,
        postCode: draft.postCode,
        maxGuests: draft.maxGuests ?? 1,
        bedrooms: draft.bedrooms ?? 0,
        beds: draft.beds ?? 1,
        bathrooms: draft.bathrooms ?? 1,
        amenities: draft.amenities ?? [],
        title: draft.title,
        highlights: draft.highlights ?? [],
        description: draft.description,
        bookingType: draft.bookingType,
        safetyDisclosures: checked,
        ...(draft.latitude !== undefined && draft.longitude !== undefined
          ? { latitude: draft.latitude, longitude: draft.longitude }
          : {}),
      });

      await clearDraft();
      router.replace({
        pathname: "/create-new-listing/success",
        params: { listingId: String(result.id) },
      });
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  return (
    <ScreenContainer>
      <WizardAppBar title="Finish up and publish" />

      <ScrollView contentContainerStyle={commonStyles.contentScroll}>
        <Text style={[commonStyles.heading, { marginBottom: 0 }]}>
          Share safety details
        </Text>

        <Text style={styles.sectionTitle}>
          Does your place have any of these?
        </Text>

        <View style={commonStyles.borderedRows}>
          {DISCLOSURES.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={commonStyles.borderedRowDivider} />}
              <View style={commonStyles.borderedRow}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Checkbox
                  status={checked.includes(item.id) ? "checked" : "unchecked"}
                  onPress={() => toggle(item.id)}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={commonStyles.divider} />

        <Text style={styles.sectionTitle}>Important things to know</Text>

        <Text style={commonStyles.bodyText}>
          Security cameras that monitor indoor spaces are not allowed even if
          they&apos;re turned off. All exterior security cameras must be
          disclosed.
        </Text>

        <Text style={commonStyles.bodyText}>
          Be sure to comply with your{" "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://skyehosts.com/legal")}
          >
            local laws
          </Text>{" "}
          and review {APP_NAME}&apos;s{" "}
          <Text
            style={styles.link}
            onPress={() =>
              Linking.openURL("https://skyehosts.com/anti-discrimination")
            }
          >
            anti-discrimination policy
          </Text>{" "}
          and{" "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://skyehosts.com/fees")}
          >
            guest and host fees
          </Text>
          .
        </Text>
      </ScrollView>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Create listing
        </Button>
      </View>
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
    paddingRight: spacing.md,
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sm,
  },
});
