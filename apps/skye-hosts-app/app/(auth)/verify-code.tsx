import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { AuthLogo } from "../components/auth-logo";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { verifyOtp } from "../services/auth.service";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleFormError } from "../utils/form-error-handler";

interface VerifyCodeFormValues {
  code: string;
}

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { phoneNumber, name } = useLocalSearchParams<{
    phoneNumber: string;
    name: string;
  }>();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    defaultValues: { code: "" },
  });

  const code = watch("code");

  const onSubmit = useCallback(
    async (data: VerifyCodeFormValues) => {
      setServerError("");
      try {
        const response = await verifyOtp(
          phoneNumber,
          data.code,
          name || undefined,
        );
        await setUser(response.user, response.pin);
        router.replace("/");
      } catch (e) {
        setAutoSubmitFailed(true);
        handleFormError(e, setError, setServerError);
      }
    },
    [phoneNumber, name, setUser, router, setError],
  );

  const showSubmitButton = autoSubmitFailed;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <AuthLogo />
          <Text variant="headlineMedium" style={styles.title}>
            Enter verification code
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            We sent a code to {phoneNumber}
          </Text>

          <View>
            <Controller
              control={control}
              name="code"
              rules={{
                required: "Code is required",
                minLength: {
                  value: 6,
                  message: "Code must be 6 digits",
                },
              }}
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="Verification code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={field.value}
                  onChangeText={(v) => {
                    field.onChange(v);
                    if (
                      v.length === 6 &&
                      !autoSubmitFailed &&
                      !hasAutoSubmitted.current
                    ) {
                      hasAutoSubmitted.current = true;
                      handleSubmit(onSubmit)();
                    }
                  }}
                  disabled={isSubmitting}
                  error={!!errors.code}
                  autoFocus
                  style={styles.input}
                  contentStyle={styles.inputContent}
                />
              )}
            />
            {errors.code && (
              <HelperText type="error" padding="none">
                {errors.code.message}
              </HelperText>
            )}
          </View>

          {showSubmitButton && (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || code.length < 6}
            >
              Verify
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
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  inputContent: {
    textAlign: "center",
    letterSpacing: spacing.sm,
    fontSize: typography.xl,
  },
});
