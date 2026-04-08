import React from "react";
import { Text } from "react-native";
import { PositionedTooltip, type TooltipAnchor } from "./positioned-tooltip";
import { formatTooltipDate, tooltipStyles } from "./tooltip-styles";

interface RestrictedDateTooltipProps {
  dateString: string;
  minNights: number;
  anchor: TooltipAnchor;
  onClose: () => void;
}

function RestrictedDateTooltipInner({
  dateString,
  minNights,
  anchor,
  onClose,
}: RestrictedDateTooltipProps) {
  return (
    <PositionedTooltip anchor={anchor} onClose={onClose}>
      <Text style={tooltipStyles.date}>{formatTooltipDate(dateString)}</Text>
      <Text style={tooltipStyles.title}>Minimum nights gap</Text>
      <Text style={[tooltipStyles.text, { marginTop: 2 }]}>
        This date can&apos;t be booked as a check-in because it&apos;s fewer
        than {minNights} night{minNights !== 1 ? "s" : ""} before the next
        booking or block.
      </Text>
    </PositionedTooltip>
  );
}

export const RestrictedDateTooltip = React.memo(RestrictedDateTooltipInner);
