import { StyleSheet } from "react-native";
import { borderRadius } from "../../theme/border-radius";
import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/font-weight";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export {
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_MARGIN,
  clampTooltipLeft,
} from "../../utils/tooltip";

export function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const tooltipStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 280,
    zIndex: 10000,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
