import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors, fontWeight, spacing, typography } from "../theme";

type HeroPriceInputProps = Pick<
  TextInputProps,
  "value" | "onChangeText" | "maxLength" | "editable" | "keyboardType"
>;

export function HeroPriceInput({
  keyboardType = "decimal-pad",
  ...rest
}: HeroPriceInputProps) {
  return (
    <TextInput
      {...rest}
      style={styles.bigPrice}
      placeholder="£0"
      placeholderTextColor={colors.textSecondary}
      keyboardType={keyboardType}
      autoFocus
      selectTextOnFocus
    />
  );
}

const styles = StyleSheet.create({
  bigPrice: {
    fontSize: typography.display,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: -spacing.md,
  },
});
