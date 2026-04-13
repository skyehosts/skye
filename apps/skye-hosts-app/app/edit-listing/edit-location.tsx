import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { Appbar, Button, HelperText, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { InfoBox } from "../components/info-box";
import { LocationPinPicker } from "../components/location-pin-picker";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { commonStyles, spacing } from "../theme";
import { captureException } from "../services/error-reporting";
import { handleApiError } from "../utils/form-error-handler";
import {
  geocodePostcode,
  SKYE_POSTCODE_REGEX,
  type GeocodedLocation,
} from "../utils/geocode-postcode";

interface LocationFormValues {
  postCode: string;
}

export default function EditLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [geocodedLocation, setGeocodedLocation] =
    useState<GeocodedLocation | null>(null);
  const [pinLocation, setPinLocation] = useState<GeocodedLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

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

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(
        `/listing/${id}/edit`,
      );
      setValue("postCode", data.postCode);
      if (data.latitude != null && data.longitude != null) {
        const loc = { latitude: data.latitude, longitude: data.longitude };
        setGeocodedLocation(loc);
        setPinLocation(loc);
      }
    } finally {
      setLoading(false);
    }
  }, [id, setValue]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleGeocode = useCallback(async (pc: string) => {
    setIsGeocoding(true);
    setGeocodeError("");

    try {
      const loc = await geocodePostcode(pc);
      setGeocodedLocation(loc);
      setPinLocation(loc);
    } catch (e) {
      captureException(e);
      setGeocodeError(
        e instanceof Error ? e.message : "Failed to look up postcode",
      );
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleLocate = () => {
    const trimmed = postCode.trim().toUpperCase();
    if (!SKYE_POSTCODE_REGEX.test(trimmed)) {
      setError("postCode", {
        message: "Please enter a valid Isle of Skye postcode (e.g. IV41 8PH)",
      });
      return;
    }
    clearErrors("postCode");
    handleGeocode(trimmed);
  };

  const handleLocationChange = useCallback(
    (latitude: number, longitude: number) => {
      setPinLocation({ latitude, longitude });
    },
    [],
  );

  const onSubmit = async (data: LocationFormValues) => {
    const trimmed = data.postCode.trim().toUpperCase();
    if (!SKYE_POSTCODE_REGEX.test(trimmed)) {
      setError("postCode", {
        message: "Please enter a valid Isle of Skye postcode (e.g. IV41 8PH)",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: IUpdateListingRequestDto = {
        postCode: trimmed,
        ...(pinLocation
          ? { latitude: pinLocation.latitude, longitude: pinLocation.longitude }
          : {}),
      };
      await fetchApi<IGetListingResponseDto, IUpdateListingRequestDto>(
        `/listing/${id}`,
        payload,
        { method: "PATCH" },
      );
      router.back();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit location" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <View style={styles.contentArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            style={styles.scrollView}
          >
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
                onPress={handleLocate}
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
            </View>
          )}
        </View>
      )}

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button
          mode="contained"
          loading={saving}
          disabled={saving || !postCode.trim()}
          onPress={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </View>
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  contentArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  content: {
    padding: spacing.lg,
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
