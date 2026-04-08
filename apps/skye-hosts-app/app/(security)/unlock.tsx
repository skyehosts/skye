import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Button } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import {
  authenticateWithBiometric,
  getBiometricType,
  isBiometricEnabled,
} from "../services/biometric.service";
import { DEFAULT_TAB } from "../services/routes";
import { ensureValidToken } from "../services/session.service";
import { commonStyles, spacing } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoTall = require("../../assets/logo-square.png");

export default function UnlockScreen() {
  const { unlock } = useAuth();
  const [checking, setChecking] = useState(true);
  const [biometricName, setBiometricName] = useState("Biometrics");
  const { width } = useWindowDimensions();
  const logoWidth = width >= 768 ? width * 0.4 : width * 0.65;

  const attemptBiometricUnlock = async (): Promise<boolean> => {
    const success = await authenticateWithBiometric();
    if (success) {
      const valid = await ensureValidToken();
      if (valid) {
        unlock();
        router.replace(DEFAULT_TAB);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    (async () => {
      const biometricOn = await isBiometricEnabled();
      if (!biometricOn) {
        router.replace("/(security)/pin-unlock");
        return;
      }

      const name = await getBiometricType();
      setBiometricName(name);
      setChecking(false);
    })();
  }, [unlock]);

  if (checking) {
    return (
      <ScreenContainer
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={commonStyles.securityContainer}>
        <Image
          source={logoTall}
          style={[styles.logo, { width: logoWidth, height: logoWidth }]}
          resizeMode="contain"
        />
        <Text style={commonStyles.securityTitle}>Welcome back</Text>
        <Text style={commonStyles.securitySubtitle}>
          Verify your identity to continue
        </Text>
        <Button
          mode="contained"
          onPress={attemptBiometricUnlock}
          style={styles.button}
        >
          Unlock with {biometricName}
        </Button>
        <Button
          mode="text"
          onPress={() => router.push("/(security)/pin-unlock")}
          style={styles.pinButton}
        >
          Use PIN instead
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginBottom: spacing.xl,
  },
  button: {
    width: "100%",
    marginBottom: spacing.md,
  },
  pinButton: {
    marginTop: spacing.sm,
  },
});
