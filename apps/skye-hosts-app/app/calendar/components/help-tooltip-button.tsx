import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { PositionedTooltip, type TooltipAnchor } from "./positioned-tooltip";
import { tooltipStyles } from "./tooltip-styles";

const BUTTON_SIZE = 48;

function HelpTooltipButtonInner() {
  const buttonRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(() => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  }, []);

  const positionStyle = useMemo(
    () => ({ bottom: insets.bottom + spacing.lg, right: spacing.lg }),
    [insets.bottom],
  );

  return (
    <>
      <View
        ref={buttonRef}
        collapsable={false}
        style={[styles.container, positionStyle]}
      >
        <IconButton
          icon="gesture-swipe"
          mode="outlined"
          size={32}
          iconColor={colors.heatherPurple}
          onPress={handlePress}
          style={styles.button}
          accessibilityLabel="Calendar help"
        />
      </View>
      {anchor && (
        <PositionedTooltip anchor={anchor} onClose={() => setAnchor(null)}>
          <View style={styles.tooltipHeader}>
            <Icon
              source="gesture-swipe"
              size={18}
              color={colors.heatherPurple}
            />
            <Text style={tooltipStyles.title}>Selecting multiple days</Text>
          </View>
          <Text style={tooltipStyles.text}>
            To block or set price overrides on multiple days, long-press any
            day, then drag across to select a date range.
          </Text>
        </PositionedTooltip>
      )}
    </>
  );
}

export const HelpTooltipButton = React.memo(HelpTooltipButtonInner);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  button: {
    margin: 0,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
});
