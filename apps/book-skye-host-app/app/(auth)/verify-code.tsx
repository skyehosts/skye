import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { applyServerErrors } from "@repo/web-components/forms/apply-server-errors";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { verifyOtp } from "../services/auth.service";
import { colors, commonStyles, spacing, typography } from "../theme";

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

  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    defaultValues: { code: "" },
  });

  const code = watch("code");

  const onSubmit = async (data: VerifyCodeFormValues) => {
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
      if (applyServerErrors(e, setError)) return;
      setServerError(
        e instanceof Error
          ? e.message
          : "Verification failed. Please try again.",
      );
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Enter verification code
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            We sent a code to {phoneNumber}
          </Text>

          <View>
            <TextInput
              mode="outlined"
              label="Verification code"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(v) => {
                setValue("code", v);
                if (errors.code) clearErrors("code");
              }}
              disabled={isSubmitting}
              error={!!errors.code}
              autoFocus
              style={styles.input}
              contentStyle={styles.inputContent}
            />
            {errors.code && (
              <HelperText type="error">{errors.code.message}</HelperText>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Verify
          </Button>
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
