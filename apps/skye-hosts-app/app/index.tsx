import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { SplashScreen } from "./components/splash-screen";
import { useAuth } from "./contexts/auth-context";
import { DEFAULT_TAB } from "./services/routes";
import StorageService, { StorageKeys } from "./services/storage";

const SPLASH_MIN_MS = 2000;

export default function HomeScreen() {
  const { isAuthenticated, isLoading, isUnlocked, needsSecuritySetup } =
    useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    StorageService.getItem<boolean>(StorageKeys.ONBOARDING_SEEN).then(
      (value) => {
        setOnboardingSeen(value === true);
        setOnboardingChecked(true);
      },
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!splashDone || isLoading || !onboardingChecked) {
    return <SplashScreen />;
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

  return <Redirect href={DEFAULT_TAB} />;
}
