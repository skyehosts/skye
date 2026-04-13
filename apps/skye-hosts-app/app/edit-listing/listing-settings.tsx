import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Appbar, HelperText, Text, TextInput } from "react-native-paper";
import { AppModal } from "../components/app-modal";
import { AppSnackbar } from "../components/app-snackbar";
import { DangerButton } from "../components/danger-button";
import { InfoBox } from "../components/info-box";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface DeleteFormValues {
  confirmation: string;
}

export default function ListingSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeleteFormValues>({
    defaultValues: { confirmation: "" },
  });

  const onDelete = async () => {
    try {
      await fetchApi(`/listing/${id}`, undefined, {
        method: "DELETE",
      });
      router.replace("/(tabs)/listings");
    } catch (e) {
      setDeleteModalVisible(false);
      handleApiError(e, setServerError);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <View style={styles.content}>
        <InfoBox variant="warning">
          Deleting a listing is permanent and cannot be undone. All associated
          data including bookings, calendar syncs, and photos will be removed.
        </InfoBox>

        <DangerButton
          variant="primary"
          onPress={() => setDeleteModalVisible(true)}
          style={styles.deleteButton}
        >
          Delete listing
        </DangerButton>
      </View>

      <AppModal
        visible={deleteModalVisible}
        onDismiss={() => {
          setDeleteModalVisible(false);
          reset();
        }}
      >
        <Text style={commonStyles.modalTitle}>Delete listing</Text>
        <Text style={commonStyles.bodyText}>
          This action is irreversible. All listing data, bookings, and calendar
          syncs will be permanently deleted. Type &ldquo;delete&rdquo; below to
          confirm.
        </Text>

        <Controller
          control={control}
          name="confirmation"
          rules={{
            validate: (v) =>
              v.toLowerCase() === "delete" || 'Please type "delete" to confirm',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label='Type "delete" to confirm'
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.confirmation}
                autoCapitalize="none"
              />
              <HelperText
                type="error"
                padding="none"
                visible={!!errors.confirmation}
              >
                {errors.confirmation?.message}
              </HelperText>
            </View>
          )}
        />

        <DangerButton
          variant="primary"
          onPress={handleSubmit(onDelete)}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deleting..." : "Delete listing"}
        </DangerButton>
      </AppModal>

      <AppSnackbar
        message={serverError ?? ""}
        onDismiss={() => setServerError(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  deleteButton: {
    alignSelf: "flex-start",
  },
});
