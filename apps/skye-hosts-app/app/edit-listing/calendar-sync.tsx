import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Appbar, Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import { InfoBox } from "../components/info-box";
import type {
  ICalendarSyncDto,
  ICalendarSyncResponseDto,
  IGetCalendarSyncsResponseDto,
} from "@repo/skye-hosts-api-client";
import { AppSnackbar } from "../components/app-snackbar";
import { CalendarSyncColumns } from "../components/calendar-sync-columns";
import { SyncHealthDot } from "../components/sync-health-dot";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { fontWeight } from "../theme/font-weight";
import { APP_DISPLAY_NAME } from "@repo/common/app-names";
import { handleApiError } from "../utils/form-error-handler";
import { getSyncHealthColor } from "../utils/sync-status";
import {
  PLATFORM_EXPORT_HELP,
  getPlatformLabel,
} from "../utils/calendar-sync-constants";

export default function CalendarSyncScreen() {
  const router = useRouter();
  const { id, flash } = useLocalSearchParams<{
    id: string;
    flash?: string;
  }>();
  const [syncs, setSyncs] = useState<ICalendarSyncDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const [exportHelpSync, setExportHelpSync] = useState<ICalendarSyncDto | null>(
    null,
  );
  const showSnackbar = useCallback(
    (message: string, type: "error" | "success" = "error") => {
      setSnackbar({ message, type });
    },
    [],
  );

  useEffect(() => {
    if (flash) {
      showSnackbar(flash, "success");
      router.setParams({ flash: undefined });
    }
  }, [flash, router, showSnackbar]);

  const loadSyncs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<IGetCalendarSyncsResponseDto>(
        `/calendar-sync/listing/${id}`,
        undefined,
        { method: "GET" },
      );
      setSyncs(data.syncs);
    } catch (e) {
      handleApiError(e, (msg) => showSnackbar(msg));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadSyncs();
    }, [loadSyncs]),
  );

  const handleTriggerImport = async (syncId: number) => {
    try {
      setSyncingId(syncId);
      const data = await fetchApi<ICalendarSyncResponseDto>(
        `/calendar-sync/${syncId}/trigger-import`,
        {},
        { method: "POST" },
      );
      setSyncs((prev) => prev.map((s) => (s.id === syncId ? data.sync : s)));
      const isSuccess = data.sync.lastImportStatus === "success";
      showSnackbar(
        isSuccess
          ? "Sync completed successfully"
          : "Sync failed — check the error details",
        isSuccess ? "success" : "error",
      );
    } catch (e) {
      handleApiError(e, (msg) => showSnackbar(msg));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Calendar sync" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <InfoBox variant="info">
            Keep your calendars in sync across platforms to avoid double
            bookings. Changes may take up to 3 hours to appear on other
            platforms.
          </InfoBox>

          <InfoBox variant="info">
            Your Skye Hosts calendar is open by default. We recommend setting
            your Airbnb calendar to {"\u2018"}unavailable by default{"\u2019"}{" "}
            so only your open season dates are available across both platforms.
            Bookings made on Skye Hosts are shared with connected calendars
            automatically. Manual blocks you create here stay on Skye Hosts
            only.
          </InfoBox>

          {syncs.length === 0 && (
            <View style={styles.emptyState}>
              <Icon source="sync-off" size={48} color={colors.iconDecorative} />
              <Text style={commonStyles.emptyText}>No calendars connected</Text>
              <Text style={commonStyles.emptySubtext}>
                Connect your AirBnB or other platform calendars to automatically
                block dates and prevent double bookings.
              </Text>
            </View>
          )}

          {syncs.map((sync) => (
            <Pressable
              key={sync.id}
              style={[commonStyles.card, styles.syncCard]}
              onPress={() =>
                router.push({
                  pathname: "/edit-listing/calendar-sync-form",
                  params: { id, syncId: String(sync.id) },
                })
              }
            >
              <View style={commonStyles.row}>
                <View style={styles.syncHeader}>
                  <SyncHealthDot color={getSyncHealthColor(sync)} />
                  <Text style={commonStyles.itemTitle}>
                    {getPlatformLabel(sync.platform)}
                  </Text>
                </View>
                <Icon source="chevron-right" size={20} color={colors.icon} />
              </View>

              <CalendarSyncColumns
                sync={sync}
                onTriggerImport={handleTriggerImport}
                syncingId={syncingId}
                onShowExportHelp={(s) => setExportHelpSync(s)}
              />
            </Pressable>
          ))}

          <Button
            mode="contained"
            onPress={() =>
              router.push({
                pathname: "/edit-listing/calendar-sync-form",
                params: { id },
              })
            }
            icon="plus"
            style={styles.addButton}
          >
            Connect a platform
          </Button>

          <Pressable
            style={commonStyles.helpLink}
            onPress={() => setHelpVisible(true)}
          >
            <Icon
              source="help-circle-outline"
              size={16}
              color={colors.heatherPurple}
            />
            <Text style={commonStyles.helpLinkText}>
              How does calendar sync work?
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={helpVisible} onDismiss={() => setHelpVisible(false)}>
          <Dialog.Title>How does calendar sync work?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Calendar syncing has built-in delays — when a booking is made on
              one platform, it may take up to a few hours to appear on another.
              This is normal and is a limitation of how calendar syncing works
              across all platforms, not just {APP_DISPLAY_NAME}.
            </Text>
            <Text style={styles.helpDialogTip}>
              For the best protection against double bookings, add an import URL
              for each platform you use.
            </Text>
            <Text style={styles.helpDialogNote}>
              In the rare event that a double booking does slip through, don't
              worry — simply cancel the duplicate on whichever platform you
              prefer and you're all sorted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setHelpVisible(false)}>Got it</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={!!exportHelpSync}
          onDismiss={() => setExportHelpSync(null)}
        >
          <Dialog.Title>Paste the export link</Dialog.Title>
          <Dialog.Content>
            <Text>
              {exportHelpSync
                ? PLATFORM_EXPORT_HELP[exportHelpSync.platform]
                : ""}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExportHelpSync(null)}>Got it</Button>
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
    gap: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  syncCard: {
    gap: spacing.sm,
  },
  syncHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  helpDialogTip: {
    marginTop: spacing.md,
    fontWeight: fontWeight.semibold,
  },
  helpDialogNote: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});
