import type {
  IEmailRequestOtpRequestDto,
  IEmailRequestOtpResponseDto,
  IEmailVerifyOtpRequestDto,
  IEmailVerifyOtpResponseDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { AppModal } from "../../components/app-modal";
import { fetchApi } from "../../services/api";
import {
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "../../theme";

interface EmailModalProps {
  visible: boolean;
  currentEmail: string | null;
  onDismiss: () => void;
  onEmailVerified: (email: string) => void;
}

type Step = "enter-email" | "enter-code";

export function EmailModal({
  visible,
  currentEmail,
  onDismiss,
  onEmailVerified,
}: EmailModalProps) {
  const [step, setStep] = useState<Step>("enter-email");
  const [email, setEmail] = useState(currentEmail ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDismiss() {
    setStep("enter-email");
    setEmail(currentEmail ?? "");
    setCode("");
    setError(null);
    onDismiss();
  }

  async function handleSendCode() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await fetchApi<IEmailRequestOtpResponseDto, IEmailRequestOtpRequestDto>(
        "/auth/email-request-otp",
        { email: email.trim() },
        { method: "POST" },
      );
      setStep("enter-code");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await fetchApi<IEmailVerifyOtpResponseDto, IEmailVerifyOtpRequestDto>(
        "/auth/email-verify-otp",
        { email: email.trim(), code: code.trim() },
        { method: "POST" },
      );
      onEmailVerified(email.trim());
      handleDismiss();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

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
          <TextInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            mode="outlined"
          />
          {error && <Text style={commonStyles.errorText}>{error}</Text>}
          <Button
            mode="contained"
            onPress={handleSendCode}
            loading={loading}
            disabled={loading || !email.trim()}
          >
            Send code
          </Button>
        </>
      ) : (
        <>
          <Text style={commonStyles.modalTitle}>Check your email</Text>
          <Text style={styles.description}>
            We sent a 6-digit code to{" "}
            <Text style={styles.emailHighlight}>{email}</Text>. Enter it below
            to verify your address.
          </Text>
          <TextInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            mode="outlined"
          />
          {error && <Text style={commonStyles.errorText}>{error}</Text>}
          <Button
            mode="contained"
            onPress={handleVerify}
            loading={loading}
            disabled={loading || code.length !== 6}
          >
            Verify
          </Button>
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive a code? </Text>
            <Button
              mode="text"
              compact
              onPress={handleSendCode}
              disabled={loading}
              style={styles.resendButton}
              labelStyle={styles.resendButtonLabel}
            >
              Resend
            </Button>
          </View>
        </>
      )}
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
    fontWeight: "600",
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
