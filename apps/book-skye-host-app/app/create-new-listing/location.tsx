import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, TextInput } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { colors, commonStyles } from "../theme";
import { useCreateListing } from "./context";

const POSTCODE_REGEX = /^IV(4[1-9]|5[1-6])\s?[0-9][A-Z]{2}$/;

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

  useEffect(() => {
    if (draft.postCode) setValue("postCode", draft.postCode);
  }, [draft.postCode, setValue]);

  const onSubmit = (data: LocationFormValues) => {
    const trimmed = data.postCode.trim().toUpperCase();
    if (!POSTCODE_REGEX.test(trimmed)) {
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

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>
          Where&apos;s your place located?
        </Text>
        <Text style={commonStyles.subheading}>
          Your address is only shared with guests after they&apos;ve made a
          reservation.
        </Text>

        <View>
          <TextInput
            label="Postcode"
            value={postCode}
            onChangeText={(text) => {
              setValue("postCode", text.toUpperCase());
              if (errors.postCode) clearErrors("postCode");
            }}
            mode="outlined"
            autoCapitalize="characters"
            style={styles.input}
            error={!!errors.postCode}
          />
          {errors.postCode && (
            <HelperText type="error">{errors.postCode.message}</HelperText>
          )}
        </View>
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
  input: {
    backgroundColor: colors.background,
  },
});
