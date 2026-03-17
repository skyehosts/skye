import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, TextInput } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import {
  getRemainingAttempts,
  isPinLocked,
  verifyPin,
} from "../services/pin.service";
import { ensureValidToken } from "../services/session.service";
import { commonStyles, spacing, typography } from "../theme";

interface PinUnlockFormValues {
  pin: string;
}

export default function PinUnlockScreen() {
  const { unlock, signOut } = useAuth();

  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PinUnlockFormValues>({
    defaultValues: { pin: "" },
  });

  const pin = watch("pin");

  const onSubmit = async (data: PinUnlockFormValues) => {
    const locked = await isPinLocked();
    if (locked) {
      await signOut();
      return;
    }

    const valid = await verifyPin(data.pin);
    if (valid) {
      const tokenValid = await ensureValidToken();
      if (tokenValid) {
        unlock();
        router.replace("/(tabs)/listings");
      } else {
        await signOut();
      }
    } else {
      const remaining = await getRemainingAttempts();
      if (remaining <= 0) {
        await signOut();
      } else {
        setError("pin", {
          message: `Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        });
        setValue("pin", "");
      }
    }
  };

  return (
    <ScreenContainer>
      <View style={commonStyles.securityContainer}>
        <Text style={commonStyles.securityTitle}>Welcome back</Text>
        <Text style={commonStyles.securitySubtitle}>
          Enter your PIN to continue
        </Text>

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
            <HelperText type="error">{errors.pin.message}</HelperText>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting || pin.length < 4}
          style={styles.button}
        >
          Unlock
        </Button>
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
});
