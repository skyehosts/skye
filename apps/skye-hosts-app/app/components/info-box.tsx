import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { borderRadius } from "../theme/border-radius";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type InfoBoxVariant = "info" | "warning" | "error";

const variantConfig: Record<
  InfoBoxVariant,
  { bg: string; icon: string; iconColor: string; textColor: string }
> = {
  info: {
    bg: colors.infoBackground,
    icon: "information-outline",
    iconColor: colors.heatherPurple,
    textColor: colors.textSecondary,
  },
  warning: {
    bg: colors.warningBackground,
    icon: "alert-outline",
    iconColor: colors.warning,
    textColor: colors.textPrimary,
  },
  error: {
    bg: colors.errorBackground,
    icon: "alert-circle-outline",
    iconColor: colors.danger,
    textColor: colors.textPrimary,
  },
};

interface InfoBoxProps {
  variant: InfoBoxVariant;
  /** Override the default icon for this variant */
  icon?: string;
  children: ReactNode;
}

export function InfoBox({ variant, icon, children }: InfoBoxProps) {
  const config = variantConfig[variant];

  return (
    <View
      style={[styles.container, { backgroundColor: config.bg }]}
      accessibilityRole={variant !== "info" ? "alert" : undefined}
    >
      <Icon source={icon ?? config.icon} size={20} color={config.iconColor} />
      <Text style={[styles.text, { color: config.textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  text: {
    flex: 1,
    fontSize: typography.sm,
  },
});
