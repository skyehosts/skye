import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { fetchApi } from "../services/api";

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
  console.debug("[PushPerms] current status:", existing.status);

  const { status } = await Notifications.requestPermissionsAsync();
  console.debug("[PushPerms] after request:", status);

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
  try {
    const granted = await requestPushPermission();
    if (!granted) return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: "66d898a2-1e55-46e8-8cb0-19eb668136dd",
    });

    await fetchApi("/notification/device-token", {
      token,
      platform: Platform.OS as "ios" | "android",
    });

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  } catch (err) {
    console.debug("[PushPerms] registration failed:", err);
  }
}
