import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { fetchApi } from "../services/api";
import { captureException } from "../services/error-reporting";
import { createLogger } from "../services/logger";

const log = createLogger("PushPerms");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests OS-level push notification permission.
 * Always calls requestPermissionsAsync so the OS prompt is shown
 * (on Android 13+ this triggers the POST_NOTIFICATIONS dialog).
 * Returns true if permission is granted.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const existing = await Notifications.getPermissionsAsync();
  log.debug("current status:", existing.status);

  const { status } = await Notifications.requestPermissionsAsync();
  log.debug("after request:", status);

  return status === "granted";
}

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const notificationResponseListener =
    useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications();

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        const url = data?.url as string | undefined;

        if (url) {
          router.push(url as never);
        }
      });

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, [isAuthenticated, router]);
}

async function registerForPushNotifications(): Promise<void> {
  let granted: boolean;
  try {
    granted = await requestPushPermission();
  } catch (err) {
    captureException(err);
    return;
  }
  if (!granted) return;

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({
      projectId: "66d898a2-1e55-46e8-8cb0-19eb668136dd",
    });
    token = result.data;
  } catch (err) {
    captureException(err);
    return;
  }

  try {
    await fetchApi("/notification/device-token", {
      token,
      platform: Platform.OS as "ios" | "android",
    });
  } catch (err) {
    captureException(err);
    return;
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}
