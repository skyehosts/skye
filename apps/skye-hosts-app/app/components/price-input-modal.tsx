import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { HelperText, Modal, Portal, Text, TextInput } from "react-native-paper";
import { ActionBar } from "./action-bar";
import { colors, commonStyles, spacing, typography } from "../theme";

interface PriceInputModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtext?: string;
  inputLabel?: string;
  valuePound: number;
  onSave: (valuePound: number) => void | Promise<void>;
  helperText?: string;
  minPound?: number;
  maxPound?: number;
}

interface FormValues {
  value: string;
}

export function PriceInputModal({
  visible,
  onDismiss,
  title,
  subtext,
  inputLabel,
  valuePound,
  onSave,
  helperText,
  minPound = 0,
  maxPound = 500,
}: PriceInputModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { value: valuePound === 0 ? "" : String(valuePound) },
  });

  useEffect(() => {
    if (visible) {
      reset({ value: valuePound === 0 ? "" : String(valuePound) });
    }
  }, [visible, valuePound, reset]);

  const onSubmit = async (data: FormValues) => {
    const parsed = data.value === "" ? 0 : parseInt(data.value, 10);
    await onSave(parsed);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>{title}</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        {subtext && <Text style={commonStyles.itemSubtext}>{subtext}</Text>}

        <View>
          {inputLabel && <Text style={styles.inputLabel}>{inputLabel}</Text>}
          <Controller
            control={control}
            name="value"
            rules={{
              validate: (raw) => {
                const n = raw === "" ? 0 : parseInt(raw, 10);
                if (n < minPound) return `Minimum is £${minPound}`;
                if (n > maxPound) return `Maximum is £${maxPound}`;
                return true;
              },
            }}
            render={({ field }) => (
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>£</Text>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={(text) =>
                    field.onChange(text.replace(/\D/g, ""))
                  }
                  error={!!errors.value}
                  disabled={isSubmitting}
                  autoFocus
                  style={styles.input}
                  dense
                />
              </View>
            )}
          />
          {errors.value ? (
            <HelperText type="error" padding="none">
              {errors.value.message}
            </HelperText>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  helperText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
