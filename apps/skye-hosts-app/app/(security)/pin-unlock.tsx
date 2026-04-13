import { router } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useForm } from "react-hook-form";
import { Button, HelperText, TextInput } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoTall = require("../../assets/logo-square.png");
import {
  getRemainingAttempts,
  isPinLocked,
  verifyPin,
} from "../services/pin.service";
import { DEFAULT_TAB } from "../services/routes";
import { ensureValidToken } from "../services/session.service";
import { commonStyles, spacing, typography } from "../theme";

interface PinUnlockFormValues {
  pin: string;
}

export default function PinUnlockScreen() {
  const { unlock, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const logoWidth = width >= 768 ? width * 0.4 : width * 0.65;

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
        router.replace(DEFAULT_TAB);
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
    <ScreenContainer avoidKeyboard>
      <View style={commonStyles.securityContainer}>
        <Image
          source={logoTall}
          style={[styles.logo, { width: logoWidth, height: logoWidth }]}
          resizeMode="contain"
        />
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
            <HelperText type="error" padding="none">
              {errors.pin.message}
            </HelperText>
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
  logo: {
    marginBottom: spacing.xl,
  },
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
