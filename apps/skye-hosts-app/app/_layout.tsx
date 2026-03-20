// Side-effect import: initialises Sentry before any component renders.
import "../sentry";

import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { SocketProvider } from "./contexts/socket-context";
import { UnreadMessagesProvider } from "./contexts/unread-messages-context";
import { usePushNotifications } from "./hooks/use-push-notifications";
import { theme } from "./theme";

function AppContent() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}

function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <SocketProvider>
          <UnreadMessagesProvider>
            <AppContent />
          </UnreadMessagesProvider>
        </SocketProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

// Sentry.wrap adds a top-level error boundary that captures unhandled errors
// thrown anywhere in the React component tree.
export default Sentry.wrap(RootLayout);
