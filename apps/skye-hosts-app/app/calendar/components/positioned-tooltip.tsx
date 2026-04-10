import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Portal } from "react-native-paper";
import { colors } from "../../theme/colors";
import { tooltipStyles, TOOLTIP_MARGIN } from "./tooltip-styles";

export interface TooltipAnchor {
  /** Window x of the anchor's left edge */
  x: number;
  /** Window y of the anchor's top edge */
  y: number;
  width: number;
  height: number;
}

interface PositionedTooltipProps {
  anchor: TooltipAnchor;
  onClose: () => void;
  children: React.ReactNode;
}

const VERTICAL_GAP = 1;
const ARROW_SIZE = 12;
const TOOLTIP_BORDER_RADIUS = 6;
const TOP_SAFE_MARGIN = 60;

function PositionedTooltipInner({
  anchor,
  onClose,
  children,
}: PositionedTooltipProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const windowWidth = Dimensions.get("window").width;
  const measured = size !== null;
  const tw = size?.width ?? 0;
  const th = size?.height ?? 0;

  const anchorCenterX = anchor.x + anchor.width / 2;
  const desiredLeft = anchorCenterX - tw / 2;
  const left = Math.max(
    TOOLTIP_MARGIN,
    Math.min(desiredLeft, windowWidth - tw - TOOLTIP_MARGIN),
  );

  const topAbove = anchor.y - th - VERTICAL_GAP;
  const flipBelow = topAbove < TOP_SAFE_MARGIN;
  const top = flipBelow ? anchor.y + anchor.height + VERTICAL_GAP : topAbove;

  const rawArrowLeft = anchorCenterX - left - ARROW_SIZE / 2;
  const arrowLeft = Math.max(
    TOOLTIP_BORDER_RADIUS,
    Math.min(
      rawArrowLeft,
      Math.max(TOOLTIP_BORDER_RADIUS, tw - TOOLTIP_BORDER_RADIUS - ARROW_SIZE),
    ),
  );
  const arrowAbsLeft = left + arrowLeft;
  const arrowAbsTop = flipBelow
    ? top - ARROW_SIZE / 2
    : top + th - ARROW_SIZE / 2;

  return (
    <Portal>
      <Pressable style={tooltipStyles.backdrop} onPress={onClose}>
        <View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (!size || size.width !== width || size.height !== height) {
              setSize({ width, height });
            }
          }}
          style={[
            tooltipStyles.tooltip,
            styles.tooltipOverride,
            { left, top, opacity: measured ? 1 : 0 },
          ]}
        >
          {children}
        </View>
        {measured && (
          <View
            pointerEvents="none"
            style={[styles.arrow, { left: arrowAbsLeft, top: arrowAbsTop }]}
          />
        )}
      </Pressable>
    </Portal>
  );
}

export const PositionedTooltip = React.memo(PositionedTooltipInner);

const styles = StyleSheet.create({
  tooltipOverride: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: TOOLTIP_BORDER_RADIUS,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  arrow: {
    position: "absolute",
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    transform: [{ rotate: "45deg" }],
    zIndex: 10001,
    elevation: 13,
  },
});
