// Side-effect import: initialises Sentry before any component renders.
import "../sentry";

import {
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from "@expo-google-fonts/open-sans";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { SocketProvider } from "./contexts/socket-context";
import { UnreadMessagesProvider } from "./contexts/unread-messages-context";
import { usePushNotifications } from "./hooks/use-push-notifications";
import { theme } from "./theme";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="edit-listing/calendar-sync-form"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontError) {
      Sentry.captureException(fontError);
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <KeyboardProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <SocketProvider>
            <UnreadMessagesProvider>
              <AppContent />
            </UnreadMessagesProvider>
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </KeyboardProvider>
  );
}

// Sentry.wrap adds a top-level error boundary that captures unhandled errors
// thrown anywhere in the React component tree.
export default Sentry.wrap(RootLayout);
