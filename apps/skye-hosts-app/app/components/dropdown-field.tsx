import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Menu } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  borderRadius,
  colors,
  fontWeight,
  spacing,
  typography,
} from "../theme";

interface DropdownFieldProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function DropdownField<T extends string>({
  label,
  value,
  options,
  onChange,
}: DropdownFieldProps<T>) {
  const [visible, setVisible] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? "Select";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
            <Text style={styles.triggerText} numberOfLines={1}>
              {selectedLabel}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.icon} />
          </Pressable>
        }
        anchorPosition="bottom"
        contentStyle={styles.menuContent}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            title={option.label}
            titleStyle={
              option.value === value ? styles.selectedItem : undefined
            }
            onPress={() => {
              onChange(option.value);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  triggerText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    flex: 1,
  },
  menuContent: {
    backgroundColor: colors.background,
  },
  selectedItem: {
    fontWeight: fontWeight.semibold,
  },
});
