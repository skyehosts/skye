import { router, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { Appbar, Button, HelperText, TextInput } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import {
  getRemainingAttempts,
  isPinLocked,
  setupPin,
  verifyPin,
} from "../services/pin.service";
import { commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface ChangePinFormValues {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

type PinField = keyof ChangePinFormValues;

export default function ChangePinScreen() {
  const { user, signOut } = useAuth();
  const appRouter = useRouter();
  const [step, setStep] = useState<"verify" | "enter" | "confirm">("verify");
  const [serverError, setServerError] = useState("");

  const {
    setValue,
    handleSubmit,
    setError,
    watch,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePinFormValues>({
    defaultValues: { currentPin: "", newPin: "", confirmPin: "" },
  });

  const activeField: PinField =
    step === "verify"
      ? "currentPin"
      : step === "enter"
        ? "newPin"
        : "confirmPin";
  const activeValue = watch(activeField);

  const handleVerifySubmit = handleSubmit(async (data) => {
    const locked = await isPinLocked();
    if (locked) {
      await signOut();
      return;
    }

    const valid = await verifyPin(data.currentPin);
    if (valid) {
      clearErrors("currentPin");
      setStep("enter");
    } else {
      const remaining = await getRemainingAttempts();
      if (remaining <= 0) {
        await signOut();
      } else {
        setError("currentPin", {
          message: `Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        });
        setValue("currentPin", "");
      }
    }
  });

  const handleEnterSubmit = handleSubmit(async (data) => {
    if (data.newPin.length < 4 || data.newPin.length > 6) {
      setError("newPin", { message: "PIN must be 4-6 digits" });
      return;
    }
    clearErrors("newPin");
    setStep("confirm");
  });

  const handleConfirmSubmit = handleSubmit(async (data) => {
    if (data.confirmPin !== data.newPin) {
      setError("confirmPin", { message: "PINs do not match. Try again." });
      setValue("confirmPin", "");
      return;
    }
    if (!user) return;
    try {
      await setupPin(data.newPin, user.id);
      router.back();
    } catch (e) {
      handleApiError(e, setServerError);
    }
  });

  const startOver = () => {
    reset();
    setStep("verify");
  };

  const renderPinInput = (field: PinField) => (
    <View style={styles.inputWrapper}>
      <TextInput
        mode="outlined"
        value={watch(field)}
        onChangeText={(text) => {
          setValue(field, text.replace(/[^0-9]/g, "").slice(0, 6));
          clearErrors(field);
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        style={styles.input}
        autoFocus
        error={!!errors[field]}
      />
      {errors[field] && (
        <HelperText type="error" padding="none">
          {errors[field]?.message}
        </HelperText>
      )}
    </View>
  );

  const titles = {
    verify: "Verify your PIN",
    enter: "Enter new PIN",
    confirm: "Confirm new PIN",
  };

  const subtitles = {
    verify: "Enter your current PIN to continue",
    enter: "Choose a 4-6 digit PIN",
    confirm: "Enter the same PIN again to confirm",
  };

  const buttonLabels = {
    verify: "Verify",
    enter: "Continue",
    confirm: "Change PIN",
  };

  const submitHandlers = {
    verify: handleVerifySubmit,
    enter: handleEnterSubmit,
    confirm: handleConfirmSubmit,
  };

  return (
    <ScreenContainer
      avoidKeyboard
      header={
        <Appbar.Header>
          <Appbar.BackAction onPress={() => appRouter.back()} />
          <Appbar.Content title="Change PIN" />
        </Appbar.Header>
      }
    >
      <View style={commonStyles.securityContainer}>
        <Text style={commonStyles.securityTitle}>{titles[step]}</Text>
        <Text style={[commonStyles.securitySubtitle, { textAlign: "center" }]}>
          {subtitles[step]}
        </Text>

        {step === "verify" && renderPinInput("currentPin")}
        {step === "enter" && renderPinInput("newPin")}
        {step === "confirm" && renderPinInput("confirmPin")}

        <Button
          mode="contained"
          onPress={submitHandlers[step]}
          loading={isSubmitting}
          disabled={isSubmitting || activeValue.length < 4}
          style={styles.button}
        >
          {buttonLabels[step]}
        </Button>

        {(step === "enter" || step === "confirm") && (
          <Button mode="text" onPress={startOver} style={styles.backButton}>
            Start over
          </Button>
        )}
      </View>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
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
