import { parseGbpToPence } from "@repo/common";
import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { colors, spacing, typography } from "../theme";

interface PriceInputProps {
  valuePence: number;
  onChangePence: (pence: number) => void;
  autoFocus?: boolean;
  label?: string;
}

export function PriceInput({
  valuePence,
  onChangePence,
  autoFocus,
  label,
}: PriceInputProps) {
  const valuePounds =
    valuePence === 0 ? "" : (valuePence / 100).toFixed(2).replace(/\.00$/, "");

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <Text style={styles.prefix}>£</Text>
        <TextInput
          mode="outlined"
          keyboardType="decimal-pad"
          value={valuePounds}
          onChangeText={(t) => onChangePence(parseGbpToPence(t))}
          autoFocus={autoFocus}
          style={styles.input}
          dense
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  prefix: {
    fontSize: typography.xxl,
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: typography.xxl,
    backgroundColor: colors.background,
  },
});
