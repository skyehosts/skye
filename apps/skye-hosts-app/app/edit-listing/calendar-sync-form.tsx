import { router, useLocalSearchParams } from "expo-router";
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

function getPlatformLabel(platform: CalendarSyncPlatform): string {
  return (
    PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? "External"
  );
}

export default function CalendarSyncFormScreen() {
  const { id, syncId } = useLocalSearchParams<{
    id: string;
    syncId?: string;
  }>();
  const isEditing = !!syncId;

  const [existingSync, setExistingSync] = useState<ICalendarSyncDto | null>(
    null,
  );
  const [existingSyncs, setExistingSyncs] = useState<ICalendarSyncDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState("");
  const [serverError, setServerError] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);

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
        if (isEditing) {
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
        setSnackbar("Failed to load sync details");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditing, syncId, id, reset]);

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
          `/calendar-sync/${syncId}`,
          {
            importUrl: data.importUrl || null,
            isImportEnabled: data.isImportEnabled,
            isExportEnabled: data.isExportEnabled,
          },
          { method: "PATCH" },
        );
      } else {
        await fetchApi<ICalendarSyncResponseDto>(
          `/calendar-sync/listing/${id}`,
          {
            platform: data.platform,
            importUrl: data.importUrl || undefined,
            isImportEnabled: data.isImportEnabled,
            isExportEnabled: data.isExportEnabled,
          },
        );
      }
      router.back();
    } catch (e) {
      handleFormError(e, control.setError as never, setServerError);
    }
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
        `/calendar-sync/${syncId}?removeBlocks=${removeBlocks}`,
        undefined,
        { method: "DELETE" },
      );
      router.back();
    } catch (e) {
      handleApiError(e, setSnackbar);
    }
  };

  const handleCopyExportUrl = async () => {
    if (existingSync?.exportUrl) {
      await Clipboard.setStringAsync(existingSync.exportUrl);
      setSnackbar("Export link copied to clipboard");
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
          <Text style={styles.sectionTitle}>Export to {platformLabel}</Text>
          <Text style={styles.sectionDescription}>
            When a guest books on {APP_DISPLAY_NAME}, those dates will
            automatically be blocked on {platformLabel} — preventing double
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
      </Portal>

      <AppSnackbar message={snackbar} onDismiss={() => setSnackbar("")} />
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
  saveButton: {
    marginTop: spacing.sm,
  },
});
