import type {
  IGetAccountDetailsResponseDto,
  IGetNotificationPreferencesResponseDto,
  INotificationPreferenceDto,
  IUpdateNotificationPreferenceRequestDto,
  IUpdateNotificationPreferenceResponseDto,
  NotificationEventType,
} from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Switch } from "react-native-paper";
import { AppModal } from "../components/app-modal";
import { ScreenContainer } from "../components/screen-container";
import { requestPushPermission } from "../hooks/use-push-notifications";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "../theme";

interface EventTypeConfig {
  eventType: NotificationEventType;
  title: string;
  description: string;
}

const EVENT_TYPES: EventTypeConfig[] = [
  {
    eventType: "booking_requested",
    title: "Booking Requested",
    description: "A guest has requested to book your property",
  },
  {
    eventType: "booking_confirmed",
    title: "Booking Confirmed",
    description: "A booking has been confirmed",
  },
  {
    eventType: "booking_cancelled",
    title: "Booking Cancelled",
    description: "A booking has been cancelled",
  },
  {
    eventType: "message_received",
    title: "Message Received",
    description: "You have received a new message from a guest",
  },
];

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<INotificationPreferenceDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventTypeConfig | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      const [prefsData, accountData] = await Promise.all([
        fetchApi<IGetNotificationPreferencesResponseDto>(
          "/notification/preferences",
        ),
        fetchApi<IGetAccountDetailsResponseDto>("/account/details"),
      ]);
      setPreferences(prefsData.preferences);
      setHasEmail(!!accountData.email);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const getPreference = (
    eventType: NotificationEventType,
  ): INotificationPreferenceDto => {
    return (
      preferences.find((p) => p.eventType === eventType) ?? {
        eventType,
        pushEnabled: true,
        emailEnabled: true,
      }
    );
  };

  const handleToggle = async (
    eventType: NotificationEventType,
    field: "pushEnabled" | "emailEnabled",
    value: boolean,
  ) => {
    if (field === "pushEnabled" && value) {
      const granted = await requestPushPermission();
      if (!granted) {
        Alert.alert(
          "Notifications Disabled",
          "Push notifications are blocked for this app. Please enable them in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }

    const current = getPreference(eventType);
    const updated = { ...current, [field]: value };

    setPreferences((prev) =>
      prev.map((p) => (p.eventType === eventType ? updated : p)),
    );

    setSaving(true);
    try {
      await fetchApi<
        IUpdateNotificationPreferenceResponseDto,
        IUpdateNotificationPreferenceRequestDto
      >(
        "/notification/preferences",
        {
          eventType,
          pushEnabled: updated.pushEnabled,
          emailEnabled: updated.emailEnabled,
        },
        { method: "PUT" },
      );
    } catch {
      setPreferences((prev) =>
        prev.map((p) => (p.eventType === eventType ? current : p)),
      );
    } finally {
      setSaving(false);
    }
  };

  const editingPref = editingEvent
    ? getPreference(editingEvent.eventType)
    : null;

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Notifications" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={commonStyles.contentScroll}>
        <Text style={styles.description}>
          Choose how you want to be notified about activity on your listings.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          EVENT_TYPES.map((event) => (
            <Pressable
              key={event.eventType}
              style={styles.item}
              onPress={() => setEditingEvent(event)}
            >
              <View style={styles.itemText}>
                <Text style={commonStyles.itemTitle}>{event.title}</Text>
                <Text style={styles.itemDescription}>{event.description}</Text>
              </View>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <AppModal
        visible={!!editingEvent}
        onDismiss={() => setEditingEvent(null)}
      >
        {editingEvent && editingPref && (
          <>
            <Text style={commonStyles.modalTitle}>{editingEvent.title}</Text>
            <Text style={styles.modalDescription}>
              {editingEvent.description}
            </Text>

            <View
              style={[commonStyles.switchRow, { paddingVertical: spacing.sm }]}
            >
              <Text style={commonStyles.switchLabel}>Push notifications</Text>
              <Switch
                value={editingPref.pushEnabled}
                onValueChange={(v) =>
                  handleToggle(editingEvent.eventType, "pushEnabled", v)
                }
                disabled={saving}
              />
            </View>

            <View
              style={[commonStyles.switchRow, { paddingVertical: spacing.sm }]}
            >
              <Text
                style={[
                  commonStyles.switchLabel,
                  !hasEmail && styles.switchLabelDisabled,
                ]}
              >
                Email notifications
              </Text>
              <Switch
                value={editingPref.emailEnabled}
                onValueChange={(v) =>
                  handleToggle(editingEvent.eventType, "emailEnabled", v)
                }
                disabled={saving || !hasEmail}
              />
            </View>
            {!hasEmail && (
              <Text style={styles.emailWarning}>
                Add your email address to enable email notifications. Go to Menu
                → Personal details.
              </Text>
            )}
          </>
        )}
      </AppModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    flex: 1,
  },
  itemDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: lineHeight.sm,
  },
  editLink: {
    fontSize: typography.sm,
    color: colors.primary,
    textDecorationLine: "underline",
    marginLeft: spacing.md,
  },
  modalDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
  switchLabelDisabled: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  emailWarning: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
});
