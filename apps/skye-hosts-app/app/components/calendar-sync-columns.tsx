import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Icon, Portal, Text } from "react-native-paper";
import { tooltipStyles } from "../calendar/components/tooltip-styles";
import { colors, commonStyles, spacing, typography } from "../theme";
import { fontWeight } from "../theme/font-weight";
import { clampTooltipLeft } from "../utils/tooltip";
import {
  formatRelativeTime,
  isAutoDisabled,
  isExportPendingWarning,
} from "../utils/sync-status";
import { getPlatformLabel } from "../utils/calendar-sync-constants";
import { InfoBox } from "./info-box";

interface CalendarSyncColumnsProps {
  sync: ICalendarSyncDto;
  onTriggerImport?: (syncId: number) => void;
  syncingId?: number | null;
  onShowExportHelp?: (sync: ICalendarSyncDto) => void;
}

export function CalendarSyncColumns({
  sync,
  onTriggerImport,
  syncingId,
  onShowExportHelp,
}: CalendarSyncColumnsProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const importAnchor = useRef<View>(null);
  const exportAnchor = useRef<View>(null);

  const showTooltipFor = useCallback(
    (ref: React.RefObject<View | null>, text: string) => {
      ref.current?.measureInWindow((x, y, _w, h) => {
        setTooltip({ x, y: y + h + 4, text });
      });
    },
    [],
  );

  const platformLabel = getPlatformLabel(sync.platform);
  const importBusy = syncingId === sync.id;
  const autoDisabled = isAutoDisabled(sync);
  const showImportButton = !!onTriggerImport && !autoDisabled;

  const exportState: "healthy" | "pending" | "overdue" = sync.lastExportedAt
    ? "healthy"
    : isExportPendingWarning(sync)
      ? "overdue"
      : "pending";

  const exportValueText =
    exportState === "healthy"
      ? `Exported ${formatRelativeTime(sync.lastExportedAt)}`
      : exportState === "pending"
        ? `Waiting for ${platformLabel}`
        : null;

  const exportTooltipText =
    exportState === "healthy"
      ? `${platformLabel} last fetched your calendar ${formatRelativeTime(
          sync.lastExportedAt,
        )}. ${platformLabel} checks for updates automatically about once an hour, so new bookings show up on ${platformLabel} without you doing anything.`
      : `After you paste your Skye export link into ${platformLabel}, it can take up to a day before ${platformLabel} fetches your calendar for the first time. Nothing to do yet ${"\u2014"} check back tomorrow.`;

  const importTooltipText = `We automatically pull the latest availability from ${platformLabel} every few hours, so any bookings made there block the same dates on Skye. Tap "Import now" to run it immediately.`;

  return (
    <View style={styles.wrapper}>
      {sync.lastImportStatus === "error" && sync.lastImportError && (
        <Text style={styles.errorText} numberOfLines={2}>
          Error: {sync.lastImportError}
        </Text>
      )}
      {autoDisabled && (
        <Text style={styles.disabledText}>
          Import paused after repeated failures. Edit to update URL and
          re-enable.
        </Text>
      )}
      {/* Import section */}
      <View style={styles.section}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Import:</Text>
          <Text style={styles.value}>
            {sync.lastImportAt
              ? `Imported ${formatRelativeTime(sync.lastImportAt)}`
              : `${platformLabel} hasn${"\u2019"}t synced yet`}
          </Text>
        </View>
        {showImportButton && (
          <View style={styles.importActionsRow}>
            <Button
              mode="outlined"
              compact
              onPress={() => onTriggerImport(sync.id)}
              loading={importBusy}
              disabled={importBusy}
              icon="download"
            >
              Import now
            </Button>
            <Pressable
              style={commonStyles.helpLink}
              onPress={() => showTooltipFor(importAnchor, importTooltipText)}
            >
              <View ref={importAnchor}>
                <Icon
                  source="help-circle-outline"
                  size={16}
                  color={colors.heatherPurple}
                />
              </View>
              <Text style={commonStyles.helpLinkText}>
                What{"\u2019"}s this?
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Export section */}
      <View style={styles.section}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Export:</Text>
          {exportValueText && (
            <>
              <Text style={styles.value}>{exportValueText}</Text>
              <Pressable
                onPress={() => showTooltipFor(exportAnchor, exportTooltipText)}
              >
                <View ref={exportAnchor}>
                  <Icon
                    source="information-outline"
                    size={18}
                    color={colors.icon}
                  />
                </View>
              </Pressable>
            </>
          )}
        </View>
        {exportState === "overdue" && (
          <View style={styles.warningWrapper}>
            <InfoBox variant="warning">
              {platformLabel} hasn{"\u2019"}t requested your calendar yet. Copy
              your export link and paste it into {platformLabel}.{" "}
              {onShowExportHelp && (
                <Text
                  style={styles.inlineHelpLink}
                  onPress={() => onShowExportHelp(sync)}
                >
                  See how
                </Text>
              )}
            </InfoBox>
          </View>
        )}
      </View>
      {tooltip && (
        <Portal>
          <Pressable
            style={tooltipStyles.backdrop}
            onPress={() => setTooltip(null)}
          >
            <View
              style={[
                tooltipStyles.tooltip,
                {
                  left: clampTooltipLeft(tooltip.x),
                  top: tooltip.y,
                },
              ]}
            >
              <Text style={tooltipStyles.text}>{tooltip.text}</Text>
            </View>
          </Pressable>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.danger,
  },
  disabledText: {
    fontSize: typography.sm,
    color: colors.warning,
  },
  section: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  heading: {
    fontSize: typography.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  value: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  importActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  warningWrapper: {
    width: "100%",
    marginTop: spacing.xs,
  },
  inlineHelpLink: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
