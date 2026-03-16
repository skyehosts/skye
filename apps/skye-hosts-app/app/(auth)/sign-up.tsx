import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { phoneLookup, requestOtp } from "../services/auth.service";
import { colors, commonStyles, spacing } from "../theme";
import { handleFormError } from "../utils/form-error-handler";

interface SignUpFormValues {
  name: string;
  phoneNumber: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpFormValues>({
    defaultValues: { name: "", phoneNumber: "" },
    mode: "onChange",
  });

  register("name", { required: "Please enter your name" });

  const name = watch("name");
  const phoneNumber = watch("phoneNumber");

  const onPhoneContinue = async () => {
    setServerError("");
    if (!phoneNumber.trim()) {
      setError("phoneNumber", { message: "Please enter your mobile number" });
      return;
    }
    try {
      const { exists } = await phoneLookup(phoneNumber);
      setIsExistingUser(exists);
      if (exists) {
        await requestOtp(phoneNumber);
        router.push({
          pathname: "/(auth)/verify-code",
          params: { phoneNumber },
        });
      }
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

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
          <Text variant="headlineMedium" style={styles.title}>
            Skye Hosts Host
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {showNameField
              ? "One more thing — what's your name?"
              : "Enter your mobile number to continue"}
          </Text>

          <View>
            <TextInput
              mode="outlined"
              label="Mobile number"
              placeholder="+44 7700 900000"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={phoneNumber}
              onChangeText={(v) => {
                setValue("phoneNumber", v);
                if (errors.phoneNumber) clearErrors("phoneNumber");
                if (isExistingUser !== null) setIsExistingUser(null);
              }}
              disabled={isSubmitting || showNameField}
              error={!!errors.phoneNumber}
              style={styles.input}
            />
            {errors.phoneNumber && (
              <HelperText type="error">{errors.phoneNumber.message}</HelperText>
            )}
          </View>

          {showNameField && (
            <View>
              <TextInput
                mode="outlined"
                label="Full name"
                placeholder="e.g. John Smith"
                autoComplete="name"
                autoCapitalize="words"
                value={name}
                onChangeText={(v) => {
                  setValue("name", v);
                  if (errors.name) clearErrors("name");
                }}
                disabled={isSubmitting}
                error={!!errors.name}
                style={styles.input}
                autoFocus
              />
              {errors.name && (
                <HelperText type="error">{errors.name.message}</HelperText>
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
                isSubmitting || phoneNumber.replace(/\s/g, "").length < 10
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
                setValue("name", "");
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
  backButton: {
    marginTop: spacing.md,
  },
});
