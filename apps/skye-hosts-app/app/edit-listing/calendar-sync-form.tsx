import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  HelperText,
  Icon,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import { Controller, useForm } from "react-hook-form";
import type {
  ICalendarSyncDto,
  ICalendarSyncResponseDto,
  IGetCalendarSyncsResponseDto,
  CalendarSyncPlatform,
} from "@repo/skye-hosts-api-client";
import { APP_DISPLAY_NAME } from "@repo/common/app-names";
import { AppSnackbar } from "../components/app-snackbar";
import { InfoBox } from "../components/info-box";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { borderRadius } from "../theme/border-radius";
import { fontWeight } from "../theme/font-weight";
import { captureException } from "../services/error-reporting";
import { handleApiError, handleFormError } from "../utils/form-error-handler";

interface FormData {
  platform: CalendarSyncPlatform;
  importUrl: string;
  isImportEnabled: boolean;
  isExportEnabled: boolean;
}

const PLATFORM_OPTIONS = [
  { value: "airbnb" as const, label: "AirBnB" },
  { value: "booking_com" as const, label: "Booking.com" },
  { value: "other" as const, label: "Other" },
];

const PLATFORM_HELP: Record<CalendarSyncPlatform, string> = {
  airbnb:
    "To find your calendar link in AirBnB: open your listing → tap Calendar → Availability Settings → scroll to 'Export Calendar' → copy the link.",
  booking_com:
    "To find your calendar link in Booking.com: open your property → Calendar & Pricing → Sync Calendars → copy the export link.",
  other:
    "Check your booking platform for a calendar export link (sometimes called an iCal or .ics link).",
};

const PLATFORM_EXPORT_HELP: Record<CalendarSyncPlatform, string> = {
  airbnb:
    "To complete the sync, paste the export link into AirBnB:\n\n" +
    "1. Open the AirBnB app\n" +
    "2. Go to your listing\n" +
    "3. Tap Calendar\n" +
    "4. Tap Availability Settings\n" +
    "5. Scroll to 'Import Calendar'\n" +
    "6. Paste the link you copied and tap Submit",
  booking_com:
    "To complete the sync, paste the export link into Booking.com:\n\n" +
    "1. Log into Booking.com (extranet)\n" +
    "2. Go to Calendar & Pricing\n" +
    "3. Tap Sync Calendars\n" +
    "4. Under 'Import calendar', paste the link you copied\n" +
    "5. Name it (e.g. 'Skye Hosts') and save",
  other:
    "To complete the sync, import this link into your booking platform.\n\n" +
    "Look for an 'Import Calendar' or 'Subscribe to iCal' option in your platform's calendar settings, then paste the link you copied.",
};

function getPlatformLabel(platform: CalendarSyncPlatform): string {
  return (
    PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? "External"
  );
}

export default function CalendarSyncFormScreen() {
  const router = useRouter();
  const { id, syncId } = useLocalSearchParams<{
    id: string;
    syncId?: string;
  }>();
  const [createdSyncId, setCreatedSyncId] = useState<number | null>(null);
  const effectiveSyncId =
    syncId ?? (createdSyncId ? String(createdSyncId) : undefined);
  const isEditing = !!effectiveSyncId;

  const [existingSync, setExistingSync] = useState<ICalendarSyncDto | null>(
    null,
  );
  const [existingSyncs, setExistingSyncs] = useState<ICalendarSyncDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [serverError, setServerError] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);
  const [exportHelpVisible, setExportHelpVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      platform: "airbnb",
      importUrl: "",
      isImportEnabled: true,
      isExportEnabled: true,
    },
  });

  const platform = watch("platform");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchApi<IGetCalendarSyncsResponseDto>(
          `/calendar-sync/listing/${id}`,
          undefined,
          { method: "GET" },
        );
        setExistingSyncs(data.syncs);
        if (syncId) {
          const sync = data.syncs.find((s) => s.id === Number(syncId));
          if (sync) {
            setExistingSync(sync);
            reset({
              platform: sync.platform,
              importUrl: sync.importUrl ?? "",
              isImportEnabled: sync.isImportEnabled,
              isExportEnabled: sync.isExportEnabled,
            });
          }
        }
      } catch (e) {
        captureException(e);
        setSnackbar({ message: "Failed to load sync details", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [syncId, id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");
      const platformLabel = getPlatformLabel(data.platform);

      if (!isEditing) {
        const duplicate = existingSyncs.find(
          (s) => s.platform === data.platform,
        );
        if (duplicate) {
          setServerError(
            `You already have a sync for ${platformLabel}. Edit the existing one instead.`,
          );
          return;
        }
      }

      if (isEditing) {
        await fetchApi<ICalendarSyncResponseDto>(
          `/calendar-sync/${effectiveSyncId}`,
          {
            importUrl: data.importUrl || null,
            isImportEnabled: data.isImportEnabled,
            isExportEnabled: data.isExportEnabled,
          },
          { method: "PATCH" },
        );
        dismissWithFlash("Sync updated");
      } else {
        const result = await fetchApi<ICalendarSyncResponseDto>(
          `/calendar-sync/listing/${id}`,
          {
            platform: data.platform,
            importUrl: data.importUrl || undefined,
            isImportEnabled: data.isImportEnabled,
            isExportEnabled: data.isExportEnabled,
          },
        );

        // Trigger an immediate import so dates appear on the calendar
        // without waiting for the next scheduled poll.
        if (data.importUrl && data.isImportEnabled) {
          try {
            await fetchApi<ICalendarSyncResponseDto>(
              `/calendar-sync/${result.sync.id}/trigger-import`,
              {},
              { method: "POST" },
            );
          } catch {
            // Non-critical — import will happen on next poll
          }
        }

        if (data.isExportEnabled) {
          // Stay on form so host sees the export URL + paste instructions
          setExistingSync(result.sync);
          setCreatedSyncId(result.sync.id);
          setSnackbar({
            message: `Calendar added — copy the export link above and paste it into ${platformLabel}`,
            type: "success",
          });
        } else {
          dismissWithFlash("Sync created successfully");
        }
      }
    } catch (e) {
      handleFormError(e, control.setError as never, setServerError);
    }
  };

  const dismissWithFlash = (flash: string) => {
    router.navigate({
      pathname: "/edit-listing/calendar-sync",
      params: { id, flash },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Remove calendar sync",
      "Do you also want to remove the blocked dates that were imported from this calendar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove sync only",
          onPress: () => deleteSync(false),
        },
        {
          text: "Remove sync and dates",
          style: "destructive",
          onPress: () => deleteSync(true),
        },
      ],
    );
  };

  const deleteSync = async (removeBlocks: boolean) => {
    try {
      await fetchApi(
        `/calendar-sync/${effectiveSyncId}?removeBlocks=${removeBlocks}`,
        undefined,
        { method: "DELETE" },
      );
      dismissWithFlash("Sync deleted");
    } catch (e) {
      handleApiError(e, (msg) => setSnackbar({ message: msg, type: "error" }));
    }
  };

  const handleCopyExportUrl = async () => {
    if (existingSync?.exportUrl) {
      await Clipboard.setStringAsync(existingSync.exportUrl);
      setSnackbar({
        message: "Export link copied to clipboard",
        type: "success",
      });
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Calendar sync" />
        </Appbar.Header>
        <ActivityIndicator style={commonStyles.sectionLoader} />
      </ScreenContainer>
    );
  }

  const platformLabel = getPlatformLabel(platform);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={
            isEditing
              ? `Edit ${existingSync ? getPlatformLabel(existingSync.platform) : ""} sync`
              : `Add ${platformLabel} calendar`
          }
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Platform picker */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform</Text>
            <Controller
              control={control}
              name="platform"
              render={({ field: { value, onChange } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={PLATFORM_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              )}
            />
          </View>
        )}

        {/* Import section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Import from {platformLabel}</Text>
            <Pressable onPress={() => setHelpVisible(true)}>
              <Icon
                source="help-circle-outline"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>
          <Text style={styles.sectionDescription}>
            Paste your {platformLabel} calendar link below. When a guest books
            on {platformLabel}, those dates will automatically be blocked on{" "}
            {APP_DISPLAY_NAME} — preventing double bookings.
          </Text>

          <Controller
            control={control}
            name="importUrl"
            rules={{
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Enter a valid URL starting with http:// or https://",
              },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                error={!!errors.importUrl}
              />
            )}
          />
          {errors.importUrl && (
            <HelperText type="error">{errors.importUrl.message}</HelperText>
          )}

          <Controller
            control={control}
            name="isImportEnabled"
            render={({ field: { value, onChange } }) => (
              <View style={commonStyles.switchRow}>
                <Text style={commonStyles.switchLabel}>Enable import</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />
        </View>

        {/* Export section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Export to {platformLabel}</Text>
            <Pressable onPress={() => setExportHelpVisible(true)}>
              <Icon
                source="help-circle-outline"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>
          <Text style={styles.sectionDescription}>
            Share your {APP_DISPLAY_NAME} calendar with {platformLabel} so
            bookings here automatically block dates there — preventing double
            bookings.
          </Text>

          <Controller
            control={control}
            name="isExportEnabled"
            render={({ field: { value, onChange } }) => (
              <View style={commonStyles.switchRow}>
                <Text style={commonStyles.switchLabel}>Enable export</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />

          {isEditing &&
            existingSync?.exportUrl &&
            existingSync.isExportEnabled && (
              <>
                <View style={styles.exportUrlBox}>
                  <Text style={styles.exportUrlLabel}>Your export link:</Text>
                  <Text style={styles.exportUrl} numberOfLines={2} selectable>
                    {existingSync.exportUrl}
                  </Text>
                  <Button
                    mode="outlined"
                    compact
                    onPress={handleCopyExportUrl}
                    icon="content-copy"
                    style={styles.copyButton}
                  >
                    Copy link
                  </Button>
                </View>
                <InfoBox variant="info">
                  Copy the above link and paste it into {platformLabel}
                  {"\u2019"}s calendar import settings.{" "}
                  <Text
                    style={styles.exportCalloutLink}
                    onPress={() => setExportHelpVisible(true)}
                  >
                    See how
                  </Text>
                </InfoBox>
              </>
            )}
        </View>

        {serverError ? (
          <Text style={commonStyles.errorText}>{serverError}</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.saveButton}
        >
          {isEditing ? "Save changes" : "Add calendar"}
        </Button>

        {isEditing && (
          <Button
            mode="text"
            textColor={colors.danger}
            onPress={handleDelete}
            icon="delete-outline"
          >
            Remove this calendar sync
          </Button>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={helpVisible} onDismiss={() => setHelpVisible(false)}>
          <Dialog.Title>Where to find your calendar link</Dialog.Title>
          <Dialog.Content>
            <Text>{PLATFORM_HELP[platform]}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setHelpVisible(false)}>Got it</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={exportHelpVisible}
          onDismiss={() => setExportHelpVisible(false)}
        >
          <Dialog.Title>How to paste the export link</Dialog.Title>
          <Dialog.Content>
            <Text>{PLATFORM_EXPORT_HELP[platform]}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExportHelpVisible(false)}>Got it</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <AppSnackbar
        message={snackbar?.message ?? ""}
        onDismiss={() => setSnackbar(null)}
        type={snackbar?.type}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  exportUrlBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  exportUrlLabel: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  exportUrl: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  copyButton: {
    alignSelf: "flex-start",
  },
  exportCalloutLink: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
