import type {
  IAccountPhoneRequestOtpRequestDto,
  IAccountPhoneRequestOtpResponseDto,
  IAccountPhoneVerifyOtpRequestDto,
  IAccountPhoneVerifyOtpResponseDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { AppModal } from "../../components/app-modal";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import { validateUkPhone } from "../../utils/phone-validation";
import {
  colors,
  commonStyles,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "../../theme";
import { handleFormError } from "../../utils/form-error-handler";

interface PhoneModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPhoneChanged: (phoneNumber: string) => void;
}

type Step = "enter-phone" | "enter-code";

interface FormValues {
  phoneNumber: string;
  code: string;
}

export function PhoneModal({
  visible,
  onDismiss,
  onPhoneChanged,
}: PhoneModalProps) {
  const [step, setStep] = useState<Step>("enter-phone");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { phoneNumber: "", code: "" },
  });

  function handleDismiss() {
    setStep("enter-phone");
    setSubmittedPhone("");
    reset({ phoneNumber: "", code: "" });
    setServerError("");
    onDismiss();
  }

  const handleSendCode = async (data: FormValues) => {
    setServerError("");
    try {
      await fetchApi<
        IAccountPhoneRequestOtpResponseDto,
        IAccountPhoneRequestOtpRequestDto
      >(
        "/auth/phone-change-request-otp",
        { phoneNumber: data.phoneNumber.trim() },
        { method: "POST" },
      );
      setSubmittedPhone(data.phoneNumber.trim());
      setStep("enter-code");
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const handleVerify = async (data: FormValues) => {
    setServerError("");
    try {
      const result = await fetchApi<
        IAccountPhoneVerifyOtpResponseDto,
        IAccountPhoneVerifyOtpRequestDto
      >(
        "/auth/phone-change-verify-otp",
        { phoneNumber: submittedPhone, code: data.code.trim() },
        { method: "POST" },
      );
      onPhoneChanged(result.phoneNumber);
      handleDismiss();
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  const handleResend = () => {
    handleSendCode({ phoneNumber: submittedPhone, code: "" });
  };

  return (
    <AppModal visible={visible} onDismiss={handleDismiss}>
      {step === "enter-phone" ? (
        <>
          <Text style={commonStyles.modalTitle}>Change phone number</Text>
          <Text style={styles.description}>
            Enter your new phone number. We'll send a verification code via SMS
            to confirm it.
          </Text>
          <View>
            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: "Phone number is required",
                validate: validateUkPhone,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  mode="outlined"
                  error={!!errors.phoneNumber}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.phoneNumber && (
              <HelperText type="error" padding="none">
                {errors.phoneNumber.message}
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
          <Text style={commonStyles.modalTitle}>Check your messages</Text>
          <Text style={styles.description}>
            We sent a 6-digit code to{" "}
            <Text style={styles.highlight}>{submittedPhone}</Text>. Enter it
            below to confirm your new number.
          </Text>
          <View>
            <Controller
              control={control}
              name="code"
              rules={{
                required: "Code is required",
                minLength: { value: 6, message: "Code must be 6 digits" },
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
  highlight: {
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
