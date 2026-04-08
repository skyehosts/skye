import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { CalendarSyncPlatform } from "@repo/skye-hosts-api-client";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { fetchApi } from "../../services/api";
import { captureException } from "../../services/error-reporting";
import { getPlatformName } from "../utils/platform-helpers";
import type { BlockedDateInfo } from "./calendar-list";
import { PositionedTooltip, type TooltipAnchor } from "./positioned-tooltip";
import { formatTooltipDate, tooltipStyles } from "./tooltip-styles";

interface BlockedDateTooltipProps {
  infos: BlockedDateInfo[];
  dateString: string;
  anchor: TooltipAnchor;
  onClose: () => void;
  onReloadData?: () => void;
}

function getRemedialText(
  source: string,
  platform: CalendarSyncPlatform | null,
): string {
  if (source === "manual") return "";
  switch (platform) {
    case "airbnb":
      return "Unblock this date in your Airbnb calendar to make it available here.";
    case "booking_com":
      return "Unblock this date in your Booking.com extranet to make it available here.";
    default:
      return "Unblock this date on the external platform to make it available here.";
  }
}

function BlockedDateTooltipInner({
  infos,
  dateString,
  anchor,
  onClose,
  onReloadData,
}: BlockedDateTooltipProps) {
  const [removing, setRemoving] = useState<number | null>(null);

  async function handleRemoveBlock(blockId: number) {
    setRemoving(blockId);
    try {
      await fetchApi(`/calendar-sync/blocks/${blockId}`, undefined, {
        method: "DELETE",
      });
      onReloadData?.();
      onClose();
    } catch (e) {
      captureException(e);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <PositionedTooltip anchor={anchor} onClose={onClose}>
      <Text style={tooltipStyles.date}>{formatTooltipDate(dateString)}</Text>
      {infos.map((info, i) => (
        <View
          key={`${info.source}-${info.blockId}-${i}`}
          style={i > 0 ? styles.sourceRow : undefined}
        >
          {info.source === "manual" ? (
            <>
              <Text style={tooltipStyles.title}>Manually blocked</Text>
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveBlock(info.blockId)}
                disabled={removing !== null}
              >
                {removing === info.blockId ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={styles.removeText}>Remove block</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={tooltipStyles.title}>
                Blocked on {getPlatformName(info.platform)}
              </Text>
              <Text style={styles.remedial}>
                {getRemedialText(info.source, info.platform)}
              </Text>
            </>
          )}
        </View>
      ))}
    </PositionedTooltip>
  );
}

export const BlockedDateTooltip = React.memo(BlockedDateTooltipInner);

const styles = StyleSheet.create({
  sourceRow: {
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  remedial: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  removeText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
    textDecorationLine: "underline",
  },
});
