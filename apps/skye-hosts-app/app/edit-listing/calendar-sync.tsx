import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Banner,
  Button,
  Dialog,
  Icon,
  Portal,
  Text,
} from "react-native-paper";
import type {
  ICalendarSyncResponseDto,
  IGetCalendarSyncsResponseDto,
} from "@repo/skye-hosts-api-client";
import { tooltipStyles } from "../calendar/components/tooltip-styles";
import { clampTooltipLeft } from "../utils/tooltip";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { borderRadius } from "../theme/border-radius";
import { fontWeight } from "../theme/font-weight";
import { APP_DISPLAY_NAME } from "@repo/common/app-names";
import { handleApiError } from "../utils/form-error-handler";
import {
  PLATFORM_LABELS,
  getAggregateSyncDirection,
  getSyncDirection,
  getSyncHealthColor,
  isAutoDisabled,
} from "../utils/sync-status";

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
  const [infoTooltip, setInfoTooltip] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const infoIconRef = useRef<View>(null);

  const showInfoTooltip = useCallback(() => {
    infoIconRef.current?.measureInWindow((x, y, _w, h) => {
      setInfoTooltip({ x, y: y + h + 4 });
    });
  }, []);

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
          <View style={styles.infoBanner}>
            <Icon
              source="information-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Keep your calendars in sync across platforms to avoid double
              bookings. Changes may take up to 3 hours to appear on other
              platforms.
            </Text>
          </View>

          <View style={styles.infoBanner}>
            <Icon
              source="calendar-blank-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Your Skye Hosts calendar is open by default. We recommend setting
              your Airbnb calendar to 'unavailable by default' so only your open
              season dates are available across both platforms. Bookings made on
              Skye Hosts are shared with connected calendars automatically.
              Manual blocks you create here stay on Skye Hosts only.
            </Text>
          </View>

          {syncs.length > 0 &&
            getAggregateSyncDirection(syncs) === "one-way" && (
              <Banner
                visible
                icon="alert-outline"
                style={styles.warningBanner}
                actions={[]}
              >
                Set up 2-way sync for best protection against double-bookings.
                Syncing only one direction may still result in overlapping
                reservations.
              </Banner>
            )}

          {syncs.length === 0 && (
            <View style={styles.emptyState}>
              <Icon source="sync-off" size={48} color={colors.textSecondary} />
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
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getSyncHealthColor(sync) },
                    ]}
                  />
                  <Text style={commonStyles.itemTitle}>
                    {PLATFORM_LABELS[sync.platform] ?? sync.platform}
                  </Text>
                </View>
                <Icon
                  source="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>

              <View style={styles.syncDetails}>
                {sync.importUrl && (
                  <Text style={commonStyles.itemSubtext}>
                    Import: {sync.isImportEnabled ? "On" : "Paused"}
                    {sync.lastImportAt &&
                      ` — Last synced ${formatRelativeTime(sync.lastImportAt)}`}
                  </Text>
                )}
                <Text style={commonStyles.itemSubtext}>
                  Export: {sync.isExportEnabled ? "On" : "Off"}
                </Text>
                {getSyncDirection(sync) === "one-way" && (
                  <View style={styles.syncDetailRow}>
                    <Icon
                      source="alert-outline"
                      size={16}
                      color={colors.warning}
                    />
                    <Text style={styles.oneWayHint}>
                      Enable import and export for full protection
                    </Text>
                  </View>
                )}
              </View>

              {sync.lastImportStatus === "error" && sync.lastImportError && (
                <Text style={styles.errorText} numberOfLines={2}>
                  Error: {sync.lastImportError}
                </Text>
              )}

              {isAutoDisabled(sync) && (
                <Text style={styles.disabledText}>
                  Import paused after repeated failures. Edit to update URL and
                  re-enable.
                </Text>
              )}

              <View style={styles.syncActions}>
                {sync.importUrl && sync.isImportEnabled && (
                  <>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleTriggerImport(sync.id)}
                      loading={syncingId === sync.id}
                      disabled={syncingId === sync.id}
                      icon="download"
                    >
                      Import now
                    </Button>
                    <Pressable onPress={showInfoTooltip}>
                      <View ref={infoIconRef}>
                        <Icon
                          source="information-outline"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                    </Pressable>
                  </>
                )}
              </View>
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
            style={styles.helpLink}
            onPress={() => setHelpVisible(true)}
          >
            <Icon
              source="help-circle-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.helpLinkText}>
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
              For the best protection against double bookings, enable both
              import and export for each platform you use.
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
      </Portal>

      {infoTooltip && (
        <Portal>
          <Pressable
            style={tooltipStyles.backdrop}
            onPress={() => setInfoTooltip(null)}
          >
            <View
              style={[
                tooltipStyles.tooltip,
                {
                  left: clampTooltipLeft(infoTooltip.x),
                  top: infoTooltip.y,
                },
              ]}
            >
              <Text style={tooltipStyles.text}>
                Pulls the latest calendar from the connected platform. Export
                updates happen automatically and cannot be triggered manually.
              </Text>
            </View>
          </Pressable>
        </Portal>
      )}

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
  infoBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  warningBanner: {
    backgroundColor: colors.warningBackground,
    borderRadius: borderRadius.md,
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  syncDetails: {
    gap: spacing.xs,
  },
  syncDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  oneWayHint: {
    fontSize: typography.sm,
    color: colors.warning,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.danger,
  },
  disabledText: {
    fontSize: typography.sm,
    color: colors.warning,
  },
  syncActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  addButton: {
    marginTop: spacing.sm,
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "center",
    paddingVertical: spacing.sm,
  },
  helpLinkText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
