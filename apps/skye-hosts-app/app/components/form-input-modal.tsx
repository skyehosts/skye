import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { HelperText, Modal, Portal, Text, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "./action-bar";
import {
  borderRadius,
  colors,
  commonStyles,
  spacing,
  typography,
} from "../theme";

interface FormInputModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtext?: string;
  value: string;
  onSave: (value: string) => void;
  onDelete?: () => void;
  maxLength?: number;
  loading?: boolean;
  optional?: boolean;
}

interface FormValues {
  value: string;
}

export function FormInputModal({
  visible,
  onDismiss,
  title,
  subtext,
  value,
  onSave,
  onDelete,
  maxLength = 200,
  loading,
  optional = false,
}: FormInputModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { value } });

  useEffect(() => {
    if (visible) {
      reset({ value });
    }
  }, [visible, value, reset]);

  const currentValue = watch("value");
  const remaining = maxLength - (currentValue?.length ?? 0);

  const onSubmit = (data: FormValues) => {
    onSave(data.value);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>{title}</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        {subtext && <Text style={commonStyles.itemSubtext}>{subtext}</Text>}

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="value"
            rules={{
              ...(optional ? {} : { required: "This field is required" }),
              maxLength: {
                value: maxLength,
                message: `Maximum ${maxLength} characters`,
              },
            }}
            render={({ field }) => (
              <TextInput
                mode="outlined"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.value}
                disabled={loading}
                multiline
                style={styles.textInput}
                contentStyle={commonStyles.multilineInput}
              />
            )}
          />
          {errors.value ? (
            <HelperText type="error" padding="none">
              {errors.value.message}
            </HelperText>
          ) : (
            <Text style={styles.charCount}>
              {remaining} characters available
            </Text>
          )}
        </View>

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSubmit(onSubmit)}
          onDelete={onDelete}
          loading={loading}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    gap: spacing.md,
    flex: 1,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    flex: 1,
  },
  charCount: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
