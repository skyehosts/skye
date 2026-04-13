import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, commonStyles, spacing } from "../theme";

interface WifiDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  network: string;
  password: string;
  onSave: (network: string, password: string) => void;
  loading?: boolean;
}

interface FormValues {
  network: string;
  password: string;
}

export function WifiDetailsModal({
  visible,
  onDismiss,
  network,
  password,
  onSave,
  loading,
}: WifiDetailsModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { network, password } });

  useEffect(() => {
    if (visible) {
      reset({ network, password });
    }
  }, [visible, network, password, reset]);

  const onSubmit = (data: FormValues) => {
    onSave(data.network, data.password);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Wi-Fi details</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <View style={styles.fields}>
          <Controller
            control={control}
            name="network"
            rules={{
              maxLength: { value: 200, message: "Maximum 200 characters" },
            }}
            render={({ field }) => (
              <View>
                <TextInput
                  mode="outlined"
                  label="Network name"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={!!errors.network}
                  disabled={loading}
                />
                {errors.network && (
                  <HelperText type="error" padding="none">
                    {errors.network.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              maxLength: { value: 200, message: "Maximum 200 characters" },
            }}
            render={({ field }) => (
              <View>
                <TextInput
                  mode="outlined"
                  label="Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={!!errors.password}
                  disabled={loading}
                />
                {errors.password && (
                  <HelperText type="error" padding="none">
                    {errors.password.message}
                  </HelperText>
                )}
              </View>
            )}
          />
        </View>

        <View style={commonStyles.divider} />

        <View style={commonStyles.row}>
          <Button mode="text" onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          >
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
  },
});
