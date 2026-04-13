import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, TextInput } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { setupPin } from "../services/pin.service";
import { commonStyles, spacing, typography } from "../theme";

interface PinFormValues {
  pin: string;
  confirmPin: string;
}

export default function PinSetupScreen() {
  const { completeSecuritySetup, user } = useAuth();
  const [step, setStep] = useState<"enter" | "confirm">("enter");

  const {
    setValue,
    handleSubmit,
    setError,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<PinFormValues>({
    defaultValues: { pin: "", confirmPin: "" },
  });

  const pin = watch("pin");
  const confirmPin = watch("confirmPin");

  const handleEnterSubmit = handleSubmit(async (data) => {
    if (data.pin.length < 4 || data.pin.length > 6) {
      setError("pin", { message: "PIN must be 4-6 digits" });
      return;
    }
    clearErrors();
    setStep("confirm");
  });

  const handleConfirmSubmit = handleSubmit(async (data) => {
    if (data.confirmPin !== data.pin) {
      setError("confirmPin", { message: "PINs do not match. Try again." });
      setValue("confirmPin", "");
      return;
    }
    if (!user) return;
    await setupPin(data.pin, user.id);
    completeSecuritySetup();
    router.replace("/(security)/biometric-setup");
  });

  return (
    <ScreenContainer avoidKeyboard>
      <View style={commonStyles.securityContainer}>
        <Text style={commonStyles.securityTitle}>
          {step === "enter" ? "Create a PIN" : "Confirm your PIN"}
        </Text>
        <Text style={[commonStyles.securitySubtitle, { textAlign: "center" }]}>
          {step === "enter"
            ? "Choose a 4-6 digit PIN to secure your app"
            : "Enter the same PIN again to confirm"}
        </Text>

        {step === "enter" ? (
          <View style={styles.inputWrapper}>
            <TextInput
              mode="outlined"
              value={pin}
              onChangeText={(text) => {
                setValue("pin", text.replace(/[^0-9]/g, "").slice(0, 6));
                clearErrors("pin");
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={styles.input}
              autoFocus
              error={!!errors.pin}
            />
            {errors.pin && (
              <HelperText type="error" padding="none">
                {errors.pin.message}
              </HelperText>
            )}
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <TextInput
              mode="outlined"
              value={confirmPin}
              onChangeText={(text) => {
                setValue("confirmPin", text.replace(/[^0-9]/g, "").slice(0, 6));
                clearErrors("confirmPin");
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={styles.input}
              autoFocus
              error={!!errors.confirmPin}
            />
            {errors.confirmPin && (
              <HelperText type="error" padding="none">
                {errors.confirmPin.message}
              </HelperText>
            )}
          </View>
        )}

        <Button
          mode="contained"
          onPress={step === "enter" ? handleEnterSubmit : handleConfirmSubmit}
          loading={isSubmitting}
          disabled={
            isSubmitting ||
            (step === "enter" ? pin.length < 4 : confirmPin.length < 4)
          }
          style={styles.button}
        >
          {step === "enter" ? "Continue" : "Set PIN"}
        </Button>

        {step === "confirm" && (
          <Button
            mode="text"
            onPress={() => {
              setStep("enter");
              setValue("pin", "");
              setValue("confirmPin", "");
              clearErrors();
            }}
            style={styles.backButton}
          >
            Start over
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  input: {
    textAlign: "center",
    fontSize: typography.xl,
    letterSpacing: 12,
  },
  button: {
    width: "100%",
  },
  backButton: {
    marginTop: spacing.md,
  },
});
