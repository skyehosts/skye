import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import {
  authenticateWithBiometric,
  enableBiometrics,
  getBiometricType,
  isBiometricAvailable,
} from "../services/biometric.service";
import { DEFAULT_TAB } from "../services/routes";
import { commonStyles, spacing } from "../theme";

export default function BiometricSetupScreen() {
  const { unlock } = useAuth();
  const [available, setAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState("Biometrics");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const isAvailable = await isBiometricAvailable();
      if (!isAvailable) {
        unlock();
        router.replace(DEFAULT_TAB);
        return;
      }
      setAvailable(true);
      const name = await getBiometricType();
      setBiometricName(name);
      setLoading(false);
    })();
  }, [unlock]);

  const handleEnable = async () => {
    const success = await authenticateWithBiometric();
    if (success) {
      await enableBiometrics();
    }
    unlock();
    router.replace(DEFAULT_TAB);
  };

  const handleSkip = () => {
    unlock();
    router.replace(DEFAULT_TAB);
  };

  if (loading) {
    return <ScreenContainer />;
  }

  return (
    <ScreenContainer>
      <View style={commonStyles.securityContainer}>
        <Text style={commonStyles.securityTitle}>Enable {biometricName}?</Text>
        <Text style={[commonStyles.securitySubtitle, { textAlign: "center" }]}>
          Use {biometricName} to quickly unlock the app instead of entering your
          PIN every time.
        </Text>
        <Button mode="contained" onPress={handleEnable} style={styles.button}>
          Enable {biometricName}
        </Button>
        <Button mode="text" onPress={handleSkip} style={styles.skipButton}>
          Skip for now
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
  skipButton: {
    marginTop: spacing.sm,
  },
});
