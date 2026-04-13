import type { IUserEditDetailsRequestDto } from "../../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { AppModal } from "../../components/app-modal";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import { colors, commonStyles, lineHeight, typography } from "../../theme";
import { handleFormError } from "../../utils/form-error-handler";

interface NameModalProps {
  visible: boolean;
  currentName: string;
  onDismiss: () => void;
  onNameChanged: (name: string) => void;
}

interface FormValues {
  name: string;
}

export function NameModal({
  visible,
  currentName,
  onDismiss,
  onNameChanged,
}: NameModalProps) {
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: currentName },
  });

  useEffect(() => {
    if (visible) {
      reset({ name: currentName });
    }
  }, [visible, currentName, reset]);

  function handleDismiss() {
    reset({ name: currentName });
    setServerError("");
    onDismiss();
  }

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      await fetchApi<undefined, IUserEditDetailsRequestDto>(
        "/user/edit-details",
        { name: data.name.trim() },
        { method: "POST" },
      );
      onNameChanged(data.name.trim());
      handleDismiss();
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  return (
    <AppModal visible={visible} onDismiss={handleDismiss}>
      <Text style={commonStyles.modalTitle}>Change name</Text>
      <Text style={styles.description}>
        Update the name shown on your account.
      </Text>
      <View>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "Name is required",
            maxLength: {
              value: 25,
              message: "Name must be 25 characters or fewer",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="name"
              mode="outlined"
              error={!!errors.name}
              disabled={isSubmitting}
            />
          )}
        />
        {errors.name && (
          <HelperText type="error" padding="none">
            {errors.name.message}
          </HelperText>
        )}
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Save
      </Button>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
});
