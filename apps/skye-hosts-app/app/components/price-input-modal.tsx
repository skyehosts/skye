import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { HelperText, Modal, Portal, Text } from "react-native-paper";
import { ActionBar } from "./action-bar";
import { HeroPriceInput } from "./hero-price-input";
import { colors, commonStyles, spacing, typography } from "../theme";

interface PriceInputModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtext?: string;
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

        {subtext && <Text style={styles.subtext}>{subtext}</Text>}

        <View>
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
              <HeroPriceInput
                value={field.value === "" ? "" : `£${field.value}`}
                onChangeText={(text) => field.onChange(text.replace(/\D/g, ""))}
                keyboardType="numeric"
                editable={!isSubmitting}
                maxLength={5}
              />
            )}
          />
          {errors.value ? (
            <HelperText type="error" padding="none" style={styles.centerText}>
              {errors.value.message}
            </HelperText>
          ) : helperText ? (
            <Text style={[styles.helperText, styles.centerText]}>
              {helperText}
            </Text>
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
  subtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  helperText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  centerText: {
    textAlign: "center",
  },
});
