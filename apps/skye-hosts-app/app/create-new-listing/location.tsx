import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Button,
  HelperText,
  TextInput,
} from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { InfoBox } from "../components/info-box";
import { LocationPinPicker } from "../components/location-pin-picker";
import { commonStyles, spacing } from "../theme";
import {
  geocodePostcode,
  SKYE_POSTCODE_REGEX,
  type GeocodedLocation,
} from "../utils/geocode-postcode";
import { captureException } from "../services/error-reporting";
import { env } from "../services/env";
import { useCreateListing } from "./context";

interface LocationFormValues {
  postCode: string;
}

export default function LocationScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();

  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: { postCode: "" },
  });

  const postCode = watch("postCode");

  const [geocodedLocation, setGeocodedLocation] =
    useState<GeocodedLocation | null>(null);
  const [pinLocation, setPinLocation] = useState<GeocodedLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  useEffect(() => {
    if (draft.postCode) setValue("postCode", draft.postCode);
    if (draft.latitude && draft.longitude) {
      const loc = { latitude: draft.latitude, longitude: draft.longitude };
      setGeocodedLocation(loc);
      setPinLocation(loc);
    }
  }, [draft.postCode, draft.latitude, draft.longitude, setValue]);

  const handleGeocode = useCallback(
    async (pc: string) => {
      console.debug("[location] handleGeocode called with:", pc);
      setIsGeocoding(true);
      setGeocodeError("");

      try {
        const loc = await geocodePostcode(pc);
        console.debug(
          "[location] geocodePostcode returned:",
          JSON.stringify(loc),
        );
        setGeocodedLocation(loc);
        setPinLocation(loc);
        setDraftField("latitude", loc.latitude);
        setDraftField("longitude", loc.longitude);
      } catch (e) {
        captureException(e);
        setGeocodeError(
          e instanceof Error
            ? e.message
            : "Failed to look up postcode. You can still continue without a pin.",
        );
      } finally {
        setIsGeocoding(false);
      }
    },
    [setDraftField],
  );

  const handleLocationChange = useCallback(
    (latitude: number, longitude: number) => {
      setPinLocation({ latitude, longitude });
      setDraftField("latitude", latitude);
      setDraftField("longitude", longitude);
    },
    [setDraftField],
  );

  const handleConfirmPostcode = () => {
    const trimmed = postCode.trim().toUpperCase();
    if (!SKYE_POSTCODE_REGEX.test(trimmed)) {
      setError("postCode", {
        message: "Please enter a valid Isle of Skye postcode (e.g. IV41 8PH)",
      });
      return;
    }
    clearErrors("postCode");
    setDraftField("postCode", trimmed);
    handleGeocode(trimmed);
  };

  const onSubmit = (data: LocationFormValues) => {
    const trimmed = data.postCode.trim().toUpperCase();
    if (!SKYE_POSTCODE_REGEX.test(trimmed)) {
      setError("postCode", {
        message: "Please enter a valid Isle of Skye postcode (e.g. IV41 8PH)",
      });
      return;
    }
    setDraftField("postCode", trimmed);
    router.push("/create-new-listing/basics");
  };

  return (
    <ScreenContainer>
      <WizardAppBar title="Tell us about your place" />

      <View style={styles.contentArea}>
        <ScrollView
          contentContainerStyle={commonStyles.contentScroll}
          style={styles.scrollView}
        >
          <Text style={commonStyles.heading}>
            Where&apos;s your place located?
          </Text>
          <Text style={commonStyles.subheading}>
            Your address is only shared with guests after they&apos;ve made a
            reservation.
          </Text>

          <View>
            <View style={commonStyles.postcodeRow}>
              <TextInput
                label="Postcode"
                value={postCode}
                onChangeText={(text) => {
                  setValue("postCode", text.toUpperCase());
                  if (errors.postCode) clearErrors("postCode");
                }}
                mode="outlined"
                autoCapitalize="characters"
                style={commonStyles.postcodeInput}
                error={!!errors.postCode}
              />
              <Button
                mode="outlined"
                onPress={handleConfirmPostcode}
                disabled={!postCode.trim() || isGeocoding}
                style={commonStyles.locateButton}
              >
                Locate
              </Button>
            </View>
            {errors.postCode && (
              <HelperText type="error" padding="none">
                {errors.postCode.message}
              </HelperText>
            )}
          </View>

          {isGeocoding && (
            <View style={commonStyles.locationLoadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={commonStyles.locationLoadingText}>
                Finding location...
              </Text>
            </View>
          )}

          {geocodeError !== "" && (
            <Text style={commonStyles.locationErrorText}>{geocodeError}</Text>
          )}
        </ScrollView>

        {geocodedLocation && !isGeocoding && (
          <View style={styles.mapArea}>
            {env.bypassGeocoding ? (
              <Text style={commonStyles.subheading}>
                Map bypassed (local dev) — stub location saved:{"\n"}
                {geocodedLocation.latitude.toFixed(5)},{" "}
                {geocodedLocation.longitude.toFixed(5)}
              </Text>
            ) : (
              <>
                <InfoBox variant="info" icon="gesture-swipe">
                  Drag the pin to your exact property location
                </InfoBox>
                <LocationPinPicker
                  initialLatitude={geocodedLocation.latitude}
                  initialLongitude={geocodedLocation.longitude}
                  onLocationChange={handleLocationChange}
                />
                {pinLocation && (
                  <Text style={commonStyles.coordsText}>
                    Pin placed at {pinLocation.latitude.toFixed(5)},{" "}
                    {pinLocation.longitude.toFixed(5)}
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={!postCode.trim()}
          onPress={handleSubmit(onSubmit)}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
