import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ScreenContainer } from "./components/screen-container";
import { useAuth } from "./contexts/auth-context";
import { sentryTest } from "./services/error-reporting";
import StorageService, { StorageKeys } from "./services/storage";
export default function HomeScreen() {
  const { isAuthenticated, isLoading, isUnlocked, needsSecuritySetup } =
    useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    sentryTest();
    StorageService.getItem<boolean>(StorageKeys.ONBOARDING_SEEN).then(
      (value) => {
        setOnboardingSeen(value === true);
        setOnboardingChecked(true);
      },
    );
  }, []);

  if (isLoading || !onboardingChecked) {
    return (
      <ScreenContainer
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-up" />;
  }

  if (needsSecuritySetup) {
    return <Redirect href="/(security)/pin-setup" />;
  }

  if (!isUnlocked) {
    return <Redirect href="/(security)/unlock" />;
  }

  return <Redirect href="/(tabs)/today" />;
}
