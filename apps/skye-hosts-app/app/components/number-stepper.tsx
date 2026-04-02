import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { colors, spacing, typography } from "../theme";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = 1,
  max,
}: NumberStepperProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counter}>
        <IconButton
          icon="minus"
          mode="outlined"
          size={18}
          iconColor={colors.primary}
          style={{ borderColor: colors.primary }}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
        />
        <Text style={styles.count}>{value}</Text>
        <IconButton
          icon="plus"
          mode="outlined"
          size={18}
          iconColor={colors.primary}
          style={{ borderColor: colors.primary }}
          disabled={max !== undefined && value >= max}
          onPress={() => onChange(value + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: typography.md,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  count: {
    fontSize: typography.md,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: "center",
  },
});
