import React from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { Portal } from "react-native-paper";
import {
  formatTooltipDate,
  tooltipStyles,
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_MARGIN,
} from "./tooltip-styles";

interface RestrictedDateTooltipProps {
  dateString: string;
  minNights: number;
  position: { x: number; y: number };
  onClose: () => void;
}

function RestrictedDateTooltipInner({
  dateString,
  minNights,
  position,
  onClose,
}: RestrictedDateTooltipProps) {
  return (
    <Portal>
      <Pressable style={tooltipStyles.backdrop} onPress={onClose}>
        <View
          style={[
            tooltipStyles.tooltip,
            {
              left: Math.max(
                TOOLTIP_MARGIN,
                Math.min(
                  position.x,
                  Dimensions.get("window").width -
                    TOOLTIP_MAX_WIDTH -
                    TOOLTIP_MARGIN,
                ),
              ),
              top: position.y - 10,
            },
          ]}
        >
          <Text style={tooltipStyles.date}>
            {formatTooltipDate(dateString)}
          </Text>
          <Text style={tooltipStyles.title}>Minimum nights gap</Text>
          <Text style={[tooltipStyles.text, { marginTop: 2 }]}>
            This date can&apos;t be booked as a check-in because it&apos;s fewer
            than {minNights} night{minNights !== 1 ? "s" : ""} before the next
            booking or block.
          </Text>
        </View>
      </Pressable>
    </Portal>
  );
}

export const RestrictedDateTooltip = React.memo(RestrictedDateTooltipInner);
