import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  Icon,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import { Controller, useForm } from "react-hook-form";
import type {
  ICalendarSyncDto,
  ICalendarSyncResponseDto,
  IGetCalendarSyncsResponseDto,
  CalendarSyncPlatform,
} from "@repo/skye-hosts-api-client";
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
  label: string;
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
    "Find your iCal URL in AirBnB: go to your listing, tap Calendar, then Availability Settings, scroll to 'Export Calendar', and copy the link.",
  booking_com:
    "Find your iCal URL in Booking.com: go to your property, tap Calendar & Pricing, then Sync Calendars, and copy the export link.",
  other:
    "Ask your booking platform for their iCal export URL. It usually ends in .ics.",
};

export default function CalendarSyncFormScreen() {
  const { id, syncId } = useLocalSearchParams<{
    id: string;
    syncId?: string;
  }>();
  const isEditing = !!syncId;

  const [existingSync, setExistingSync] = useState<ICalendarSyncDto | null>(
    null,
  );
  const [loading, setLoading] = useState(isEditing);
  const [snackbar, setSnackbar] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      platform: "airbnb",
      label: "AirBnB Calendar",
      importUrl: "",
      isImportEnabled: true,
      isExportEnabled: true,
    },
  });

  const platform = watch("platform");

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const data = await fetchApi<IGetCalendarSyncsResponseDto>(
          `/calendar-sync/listing/${id}`,
          undefined,
          { method: "GET" },
        );
        const sync = data.syncs.find((s) => s.id === Number(syncId));
        if (sync) {
          setExistingSync(sync);
          reset({
            platform: sync.platform,
            label: sync.label,
            importUrl: sync.importUrl ?? "",
            isImportEnabled: sync.isImportEnabled,
            isExportEnabled: sync.isExportEnabled,
          });
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
      if (isEditing) {
        await fetchApi<ICalendarSyncResponseDto>(
          `/calendar-sync/${syncId}`,
          {
            label: data.label,
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
            label: data.label,
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

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={isEditing ? "Edit calendar sync" : "Add external calendar"}
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
                  onValueChange={(val) => {
                    onChange(val);
                    const opt = PLATFORM_OPTIONS.find((o) => o.value === val);
                    if (opt) setValue("label", `${opt.label} Calendar`);
                  }}
                  buttons={PLATFORM_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              )}
            />
          </View>
        )}

        {/* Label */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <Controller
            control={control}
            name="label"
            rules={{ required: "Label is required" }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. AirBnB Calendar"
                error={!!errors.label}
              />
            )}
          />
          {errors.label && (
            <HelperText type="error">{errors.label.message}</HelperText>
          )}
        </View>

        {/* Import section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Import (External to Skye)</Text>
            <Tooltip title={PLATFORM_HELP[platform]}>
              <Icon
                source="help-circle-outline"
                size={20}
                color={colors.primary}
              />
            </Tooltip>
          </View>
          <Text style={styles.sectionDescription}>
            Paste the iCal export URL from your external platform. Skye will
            periodically fetch this to block dates on your Skye calendar.
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
          <Text style={styles.sectionTitle}>Export (Skye to External)</Text>
          <Text style={styles.sectionDescription}>
            When enabled, a public link is generated that your external platform
            can import to see your Skye bookings and blocked dates.
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
