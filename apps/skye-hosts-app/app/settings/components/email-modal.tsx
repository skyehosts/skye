import type {
  IEmailRequestOtpRequestDto,
  IEmailRequestOtpResponseDto,
  IEmailVerifyOtpRequestDto,
  IEmailVerifyOtpResponseDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { AppModal } from "../../components/app-modal";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "../../theme";
import { handleFormError } from "../../utils/form-error-handler";

interface EmailModalProps {
  visible: boolean;
  currentEmail: string | null;
  onDismiss: () => void;
  onEmailVerified: (email: string) => void;
}

type Step = "enter-email" | "enter-code";

interface FormValues {
  email: string;
  code: string;
}

export function EmailModal({
  visible,
  currentEmail,
  onDismiss,
  onEmailVerified,
}: EmailModalProps) {
  const [step, setStep] = useState<Step>("enter-email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: "", code: "" },
  });

  function handleDismiss() {
    setStep("enter-email");
    setSubmittedEmail("");
    reset({ email: "", code: "" });
    setServerError("");
    onDismiss();
  }

  const handleSendCode = async (data: FormValues) => {
    setServerError("");
    try {
      await fetchApi<IEmailRequestOtpResponseDto, IEmailRequestOtpRequestDto>(
        "/auth/email-request-otp",
        { email: data.email.trim() },
        { method: "POST" },
      );
      setSubmittedEmail(data.email.trim());
      setStep("enter-code");
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const handleVerify = async (data: FormValues) => {
    setServerError("");
    try {
      await fetchApi<IEmailVerifyOtpResponseDto, IEmailVerifyOtpRequestDto>(
        "/auth/email-verify-otp",
        { email: submittedEmail, code: data.code.trim() },
        { method: "POST" },
      );
      onEmailVerified(submittedEmail);
      handleDismiss();
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const handleResend = () => {
    handleSendCode({ email: submittedEmail, code: "" });
  };

  return (
    <AppModal visible={visible} onDismiss={handleDismiss}>
      {step === "enter-email" ? (
        <>
          <Text style={commonStyles.modalTitle}>
            {currentEmail ? "Change email" : "Add email"}
          </Text>
          <Text style={styles.description}>
            Enter your email address. We'll send a verification code to confirm
            it's yours.
          </Text>
          <View>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
                validate: (value: string) =>
                  value.trim().toLowerCase() !== currentEmail?.toLowerCase() ||
                  "This is your current email",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  mode="outlined"
                  error={!!errors.email}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.email && (
              <HelperText type="error" padding="none">
                {errors.email.message}
              </HelperText>
            )}
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit(handleSendCode)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Send code
          </Button>
        </>
      ) : (
        <>
          <Text style={commonStyles.modalTitle}>Check your email</Text>
          <Text style={styles.description}>
            We sent a 6-digit code to{" "}
            <Text style={styles.emailHighlight}>{submittedEmail}</Text>. Enter
            it below to verify your address.
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
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Verification code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  mode="outlined"
                  error={!!errors.code}
                  disabled={isSubmitting}
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
            onPress={handleSubmit(handleVerify)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Verify
          </Button>
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive a code? </Text>
            <Button
              mode="text"
              compact
              onPress={handleResend}
              disabled={isSubmitting}
              style={styles.resendButton}
              labelStyle={styles.resendButtonLabel}
            >
              Resend
            </Button>
          </View>
        </>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  resendText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  resendButton: {
    marginLeft: -spacing.sm,
  },
  resendButtonLabel: {
    fontSize: typography.sm,
  },
});
