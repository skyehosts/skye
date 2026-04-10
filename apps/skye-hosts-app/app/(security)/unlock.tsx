import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { AuthLogo } from "../components/auth-logo";
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

export default function UnlockScreen() {
  const { unlock } = useAuth();
  const [checking, setChecking] = useState(true);
  const [biometricName, setBiometricName] = useState("Biometrics");

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
        <AuthLogo />
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
  button: {
    width: "100%",
    marginBottom: spacing.md,
  },
  pinButton: {
    marginTop: spacing.sm,
  },
});
