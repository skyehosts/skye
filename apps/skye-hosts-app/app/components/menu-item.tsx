import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-paper";
import { colors, fontFamily, spacing, typography } from "../theme";

export interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon
        source={icon}
        size={22}
        color={danger ? colors.danger : colors.icon}
      />
      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
        {label}
      </Text>
      {!danger && <Icon source="chevron-right" size={22} color={colors.icon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontFamily: fontFamily.headingSemibold,
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  menuItemTextDanger: {
    color: colors.danger,
  },
});
