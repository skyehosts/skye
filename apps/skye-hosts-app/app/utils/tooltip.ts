import { Dimensions } from "react-native";

export const TOOLTIP_MAX_WIDTH = 280;
export const TOOLTIP_MARGIN = 8;

/**
 * Clamps a horizontal position so the tooltip stays within the viewport.
 * Guarantees at least TOOLTIP_MARGIN px from both left and right edges.
 */
export function clampTooltipLeft(
  x: number,
  maxWidth = TOOLTIP_MAX_WIDTH,
  margin = TOOLTIP_MARGIN,
): number {
  const windowWidth = Dimensions.get("window").width;
  return Math.max(margin, Math.min(x, windowWidth - maxWidth - margin));
}
