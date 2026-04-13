import type {
  IAcceptCoHostInviteResponseDto,
  IGetCoHostInviteDetailsResponseDto,
  IPhoneLookupResponseDto,
  IPhoneRequestOtpRequestDto,
  IPhoneRequestOtpResponseDto,
  IPhoneVerifyOtpRequestDto,
  IPhoneVerifyOtpResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { ApiRequestError } from "@repo/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { fetchApi } from "../services/api";
import { captureException } from "../services/error-reporting";
import { phoneLookup, requestOtp, verifyOtp } from "../services/auth.service";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import {
  handleFormError,
  SERVER_ERROR_MESSAGE,
} from "../utils/form-error-handler";

const CO_HOST_ROLE_LABELS: Record<string, string> = {
  full_access: "Full Access",
  calendar_and_messaging: "Calendar & Messaging",
  calendar_only: "Calendar Only",
};

type Step =
  | "loading"
  | "error"
  | "preview"
  | "signup-phone"
  | "signup-otp"
  | "accepted";

interface SignUpFormValues {
  phoneNumber: string;
  name: string;
  code: string;
}

export default function InviteLandingScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuth();

  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] =
    useState<IGetCoHostInviteDetailsResponseDto | null>(null);
  const [serverError, setServerError] = useState("");
  const [acceptedListingId, setAcceptedListingId] = useState<number | null>(
    null,
  );
  const hasAutoSubmitted = useRef(false);

  const {
    control,
    setValue,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: { phoneNumber: "", name: "", code: "" },
  });

  const phoneNumber = watch("phoneNumber");
  const name = watch("name");
  const code = watch("code");

  const loadInvite = useCallback(async () => {
    if (!token) {
      setStep("error");
      return;
    }
    try {
      const data = await fetchApi<IGetCoHostInviteDetailsResponseDto>(
        `/co-host-invite/details/${token}`,
      );
      setInvite(data);

      if (data.status !== "pending") {
        setServerError(`This invite is ${data.status}`);
        setStep("error");
        return;
      }

      setStep("preview");
    } catch (e) {
      captureException(e);
      setServerError("Could not load invite. It may be invalid or expired.");
      setStep("error");
    }
  }, [token]);

  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  const acceptInvite = useCallback(async () => {
    try {
      const result = await fetchApi<IAcceptCoHostInviteResponseDto>(
        "/co-host-invite/accept",
        { token },
      );
      setAcceptedListingId(result.listingId);
      setStep("accepted");
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) {
        if (e.statusCode >= 500) {
          captureException(e);
          setServerError(SERVER_ERROR_MESSAGE);
        } else {
          setServerError(e.message);
        }
      } else {
        captureException(e);
        setServerError(
          e instanceof Error ? e.message : "Failed to accept invite",
        );
      }
    }
  }, [token]);

  const onAcceptPress = async () => {
    if (!isAuthenticated) {
      setStep("signup-phone");
      return;
    }
    await acceptInvite();
  };

  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);

  const onPhoneContinue = handleSubmit(async (data) => {
    setServerError("");
    try {
      const { exists } = await phoneLookup(data.phoneNumber);
      setIsExistingUser(exists);

      if (!exists) {
        return;
      }

      await requestOtp(data.phoneNumber);
      setStep("signup-otp");
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  });

  const onNewUserSendCode = async (data: SignUpFormValues) => {
    setServerError("");
    try {
      await requestOtp(data.phoneNumber);
      setStep("signup-otp");
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const onVerifyCode = useCallback(
    async (data: SignUpFormValues) => {
      setServerError("");
      try {
        const response = await verifyOtp(
          phoneNumber,
          data.code,
          isExistingUser ? undefined : name || undefined,
          invite?.inviteeEmail,
        );

        await setUser(response.user, response.pin);
        await acceptInvite();
      } catch (e) {
        handleFormError(e, setError, setServerError);
      }
    },
    [phoneNumber, name, isExistingUser, setUser, acceptInvite, setError],
  );

  if (step === "loading") {
    return (
      <ScreenContainer>
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
          <Text>Loading invite...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (step === "error") {
    return (
      <ScreenContainer>
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>
            {serverError || "Something went wrong"}
          </Text>
          <Button mode="outlined" onPress={() => router.replace("/")}>
            Go to Home
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  if (step === "accepted") {
    return (
      <ScreenContainer>
        <View style={commonStyles.centered}>
          <Text style={styles.acceptedTitle}>You're in!</Text>
          <Text style={commonStyles.bodyText}>
            You now have{" "}
            {CO_HOST_ROLE_LABELS[invite?.role ?? ""] ?? invite?.role} access to{" "}
            {invite?.listingTitle}.
          </Text>
          <Button
            mode="contained"
            onPress={() =>
              router.replace(
                acceptedListingId
                  ? `/edit-listing/${acceptedListingId}`
                  : "/(tabs)/listings",
              )
            }
          >
            View listing
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Invite preview card */}
          {invite && (
            <View style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>You've been invited</Text>
              <Text style={styles.listingTitle}>{invite.listingTitle}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invited by</Text>
                <Text style={styles.detailValue}>{invite.inviterName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>
                  {CO_HOST_ROLE_LABELS[invite.role] ?? invite.role}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sent to</Text>
                <Text style={styles.detailValue}>{invite.inviteeEmail}</Text>
              </View>
            </View>
          )}

          {step === "preview" && (
            <View style={styles.actions}>
              <Button mode="contained" onPress={onAcceptPress}>
                {isAuthenticated ? "Accept Invite" : "Get Started"}
              </Button>
              <Button mode="text" onPress={() => router.back()}>
                Decline
              </Button>
            </View>
          )}

          {step === "signup-phone" && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>
                Sign up to accept this invite
              </Text>
              <Text style={styles.formSubtitle}>
                Enter your mobile number to continue
              </Text>

              <View>
                <Controller
                  control={control}
                  name="phoneNumber"
                  rules={{
                    required: "Please enter your mobile number",
                    validate: (v) =>
                      v.replace(/\s/g, "").length >= 10 ||
                      "Please enter a valid mobile number",
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
                      disabled={isSubmitting || isExistingUser === false}
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

              {isExistingUser === false && (
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

              {isExistingUser === false ? (
                <Button
                  mode="contained"
                  onPress={handleSubmit(onNewUserSendCode)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
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

              {isExistingUser === false && (
                <Button
                  mode="text"
                  onPress={() => {
                    setIsExistingUser(null);
                    setValue("name", "");
                  }}
                >
                  Use a different number
                </Button>
              )}
            </View>
          )}

          {step === "signup-otp" && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Enter verification code</Text>
              <Text style={styles.formSubtitle}>
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
                        if (v.length === 6 && !hasAutoSubmitted.current) {
                          hasAutoSubmitted.current = true;
                          handleSubmit(onVerifyCode)();
                        }
                      }}
                      disabled={isSubmitting}
                      error={!!errors.code}
                      autoFocus
                      style={styles.input}
                      contentStyle={styles.codeInput}
                    />
                  )}
                />
                {errors.code && (
                  <HelperText type="error" padding="none">
                    {errors.code.message}
                  </HelperText>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit(onVerifyCode)}
                loading={isSubmitting}
                disabled={isSubmitting || code.length < 6}
              >
                Verify & Accept
              </Button>
            </View>
          )}
        </ScrollView>

        <AppSnackbar
          message={serverError}
          onDismiss={() => setServerError("")}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inviteCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  inviteLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listingTitle: {
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
  },
  formSection: {
    gap: spacing.md,
  },
  formTitle: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  formSubtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  input: {
    marginBottom: spacing.xs,
  },
  codeInput: {
    textAlign: "center",
    letterSpacing: spacing.sm,
    fontSize: typography.xl,
  },
  acceptedTitle: {
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
});
