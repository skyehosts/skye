import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { DangerButton } from "../components/danger-button";
import { InfoBox } from "../components/info-box";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontFamily,
  spacing,
  typography,
} from "../theme";
import { borderRadius } from "../theme/border-radius";
import { fontWeight } from "../theme/font-weight";
import { captureException } from "../services/error-reporting";
import { handleApiError, handleFormError } from "../utils/form-error-handler";
import {
  PLATFORM_OPTIONS,
  PLATFORM_HELP,
  PLATFORM_EXPORT_HELP,
  getPlatformLabel,
} from "../utils/calendar-sync-constants";

interface FormData {
  platform: CalendarSyncPlatform;
  importUrl: string;
}

export default function CalendarSyncFormScreen() {
  const router = useRouter();
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
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [serverError, setServerError] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);
  const [exportHelpVisible, setExportHelpVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          `/calendar-sync/${syncId}`,
          {
            importUrl: data.importUrl,
          },
          { method: "PATCH" },
        );
        dismissWithFlash("Sync updated");
      } else {
        const result = await fetchApi<ICalendarSyncResponseDto>(
          `/calendar-sync/listing/${id}`,
          {
            platform: data.platform,
            importUrl: data.importUrl,
          },
        );

        // Trigger an immediate import so dates appear on the calendar
        // without waiting for the next scheduled poll. Await it so the
        // listing screen reflects the updated sync health on first load
        // rather than showing an "unknown" (grey) status until the next
        // focus.
        try {
          await fetchApi<ICalendarSyncResponseDto>(
            `/calendar-sync/${result.sync.id}/trigger-import`,
            {},
            { method: "POST" },
          );
        } catch {
          // Non-critical — import will happen on next poll
        }

        dismissWithFlash(
          `${platformLabel} calendar added — copy the export link to complete 2-way sync`,
        );
      }
    } catch (e) {
      handleFormError(e, control.setError as never, setServerError);
    }
  };

  const dismissWithFlash = (flash: string) => {
    router.dismissTo({
      pathname: "/edit-listing/calendar-sync",
      params: { id, flash },
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await fetchApi(`/calendar-sync/${syncId}`, undefined, {
        method: "DELETE",
      });
      setDeleteVisible(false);
      dismissWithFlash("Sync deleted");
    } catch (e) {
      handleApiError(e, (msg) => setSnackbar({ message: msg, type: "error" }));
    } finally {
      setDeleting(false);
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

        {!isEditing && platform !== "airbnb" && (
          <InfoBox variant="info">
            Only AirBnB is available at this time. Support for {platformLabel}{" "}
            is coming soon.
          </InfoBox>
        )}

        <View
          style={
            !isEditing && platform !== "airbnb"
              ? styles.comingSoonDisabled
              : undefined
          }
          pointerEvents={!isEditing && platform !== "airbnb" ? "none" : "auto"}
        >
          {/* Import section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Import from {platformLabel}
              </Text>
              <Pressable onPress={() => setHelpVisible(true)}>
                <Icon
                  source="help-circle-outline"
                  size={20}
                  color={colors.heatherPurple}
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
                required: "Import URL is required",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message:
                    "Enter a valid URL starting with http:// or https://",
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
              <HelperText type="error" padding="none">
                {errors.importUrl.message}
              </HelperText>
            )}
          </View>

          {/* Export section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Export to {platformLabel}</Text>
              <Pressable onPress={() => setExportHelpVisible(true)}>
                <Icon
                  source="help-circle-outline"
                  size={20}
                  color={colors.heatherPurple}
                />
              </Pressable>
            </View>
            <Text style={styles.sectionDescription}>
              Share your {APP_DISPLAY_NAME} calendar with {platformLabel} so
              bookings here automatically block dates there — preventing double
              bookings.
            </Text>

            {isEditing && existingSync?.exportUrl && (
              <View style={styles.exportCard}>
                <View style={styles.exportCardHeader}>
                  <Icon
                    source="information-outline"
                    size={24}
                    color={colors.heatherPurple}
                  />
                  <Text style={styles.exportCardHeading}>
                    Share this link with {platformLabel}
                  </Text>
                </View>
                <Text style={styles.exportUrl} numberOfLines={2} selectable>
                  {existingSync.exportUrl}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={handleCopyExportUrl}
                  icon="content-copy"
                  style={styles.exportCardCopyButton}
                >
                  Copy link
                </Button>
                <Text style={styles.exportCardBody}>
                  Paste it into {platformLabel}
                  {"\u2019"}s calendar import settings so bookings on{" "}
                  {APP_DISPLAY_NAME} block those dates automatically.{" "}
                  <Text
                    style={styles.exportCalloutLink}
                    onPress={() => setExportHelpVisible(true)}
                  >
                    See how
                  </Text>
                </Text>
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
            <DangerButton
              variant="secondary"
              onPress={() => setDeleteVisible(true)}
              icon="delete-outline"
            >
              Remove this calendar sync
            </DangerButton>
          )}
        </View>
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
        {existingSync && (
          <Dialog
            visible={deleteVisible}
            onDismiss={() => !deleting && setDeleteVisible(false)}
            dismissable={!deleting}
          >
            <Dialog.Title>
              Remove {getPlatformLabel(existingSync.platform)} sync?
            </Dialog.Title>
            <Dialog.Content>
              <Text>
                {(existingSync.lastImportEventCount ?? 0) > 0
                  ? `This will remove the sync and ${existingSync.lastImportEventCount} imported ${existingSync.lastImportEventCount === 1 ? "date" : "dates"}.`
                  : "This will remove the sync."}
                {"\n\n"}
                You can re-add this calendar at any time — your dates will be
                re-imported from {getPlatformLabel(existingSync.platform)}.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setDeleteVisible(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <DangerButton
                variant="secondary"
                onPress={confirmDelete}
                loading={deleting}
                disabled={deleting}
              >
                Remove sync
              </DangerButton>
            </Dialog.Actions>
          </Dialog>
        )}
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
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  exportCard: {
    backgroundColor: colors.infoBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  exportCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  exportCardHeading: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  exportUrl: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  exportCardCopyButton: {
    alignSelf: "flex-start",
  },
  exportCardBody: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  exportCalloutLink: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  comingSoonDisabled: {
    opacity: 0.5,
    gap: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
