import type {
  IUpdateAccountPrivacyRequestDto,
  IUpdateAccountPrivacyResponseDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Switch } from "react-native-paper";
import { AppModal } from "../../components/app-modal";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import { colors, commonStyles, lineHeight, typography } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

interface SearchEngineIndexingModalProps {
  visible: boolean;
  currentValue: boolean;
  onDismiss: () => void;
  onChanged: (enabled: boolean) => void;
}

export function SearchEngineIndexingModal({
  visible,
  currentValue,
  onDismiss,
  onChanged,
}: SearchEngineIndexingModalProps) {
  const [enabled, setEnabled] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (visible) {
      setEnabled(currentValue);
    }
  }, [visible, currentValue]);

  function handleDismiss() {
    setEnabled(currentValue);
    setServerError("");
    onDismiss();
  }

  async function handleSave() {
    setSaving(true);
    setServerError("");
    try {
      const result = await fetchApi<
        IUpdateAccountPrivacyResponseDto,
        IUpdateAccountPrivacyRequestDto
      >(
        "/account/privacy",
        { searchEngineIndexingEnabled: enabled },
        { method: "PATCH" },
      );
      onChanged(result.searchEngineIndexingEnabled);
      onDismiss();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppModal visible={visible} onDismiss={handleDismiss}>
      <Text style={commonStyles.modalTitle}>Search engine visibility</Text>
      <Text style={styles.description}>
        When enabled, your listing page(s) can appear in search engine results
        like Google. This can help more guests discover your property.
      </Text>

      <View style={commonStyles.switchRow}>
        <Text style={commonStyles.switchLabel}>Show in search results</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          disabled={saving}
          color={colors.primary}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
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
