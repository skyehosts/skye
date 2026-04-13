import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { AuthLogo } from "../components/auth-logo";
import { ScreenContainer } from "../components/screen-container";
import { phoneLookup, requestOtp } from "../services/auth.service";
import { colors, commonStyles, spacing } from "../theme";
import { handleFormError } from "../utils/form-error-handler";
import { validateUkPhone } from "../utils/phone-validation";

interface SignUpFormValues {
  name: string;
  phoneNumber: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: { name: "", phoneNumber: "" },
  });

  const phoneNumber = watch("phoneNumber");
  const name = watch("name");

  const onPhoneContinue = handleSubmit(async (data) => {
    setServerError("");
    try {
      const { exists } = await phoneLookup(data.phoneNumber);
      setIsExistingUser(exists);
      if (exists) {
        await requestOtp(data.phoneNumber);
        router.push({
          pathname: "/(auth)/verify-code",
          params: { phoneNumber: data.phoneNumber },
        });
      }
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  });

  const onNewUserSubmit = async (data: SignUpFormValues) => {
    setServerError("");
    try {
      await requestOtp(data.phoneNumber);
      router.push({
        pathname: "/(auth)/verify-code",
        params: { phoneNumber: data.phoneNumber, name: data.name },
      });
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const showNameField = isExistingUser === false;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <AuthLogo />

          <Text variant="bodyLarge" style={styles.subtitle}>
            {showNameField
              ? "One more thing — what's your name?"
              : "Enter your mobile number to continue"}
          </Text>

          <View>
            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: "Please enter your mobile number",
                validate: validateUkPhone,
              }}
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="Mobile number"
                  placeholder="+44 7700 900000"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={field.value}
                  onChangeText={(v) => {
                    field.onChange(v);
                    if (isExistingUser !== null) setIsExistingUser(null);
                  }}
                  disabled={isSubmitting || showNameField}
                  error={!!errors.phoneNumber}
                  style={styles.input}
                />
              )}
            />
            {errors.phoneNumber && (
              <HelperText type="error" padding="none">
                {errors.phoneNumber.message}
              </HelperText>
            )}
          </View>

          {showNameField && (
            <View>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Please enter your name" }}
                render={({ field }) => (
                  <TextInput
                    mode="outlined"
                    label="Full name"
                    placeholder="e.g. John Smith"
                    autoComplete="name"
                    autoCapitalize="words"
                    value={field.value}
                    onChangeText={field.onChange}
                    disabled={isSubmitting}
                    error={!!errors.name}
                    style={styles.input}
                    autoFocus
                  />
                )}
              />
              {errors.name && (
                <HelperText type="error" padding="none">
                  {errors.name.message}
                </HelperText>
              )}
            </View>
          )}

          {showNameField ? (
            <Button
              mode="contained"
              onPress={handleSubmit(onNewUserSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || !name.trim()}
            >
              Send verification code
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={onPhoneContinue}
              loading={isSubmitting}
              disabled={
                isSubmitting || phoneNumber.replace(/[\s\-()]/g, "").length < 10
              }
            >
              Continue
            </Button>
          )}

          {showNameField && (
            <Button
              mode="text"
              onPress={() => {
                setIsExistingUser(null);
              }}
              style={styles.backButton}
            >
              Use a different number
            </Button>
          )}
        </View>

        <AppSnackbar
          message={serverError}
          onDismiss={() => setServerError("")}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.md,
  },
});
