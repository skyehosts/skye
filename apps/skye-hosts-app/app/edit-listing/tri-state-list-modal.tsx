import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import type {
  ITriStateItemConfig,
  TriStateValue,
} from "../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Modal, Portal, SegmentedButtons } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "../components/action-bar";
import { AppSnackbar } from "../components/app-snackbar";
import { fetchApi } from "../services/api";
import { borderRadius, colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

type TriStateValues = Record<string, TriStateValue>;

export function parseTriStateEntries(entries: string[]): TriStateValues {
  const result: TriStateValues = {};
  for (const entry of entries) {
    const colonIndex = entry.indexOf(":");
    if (colonIndex === -1) continue;
    result[entry.slice(0, colonIndex)] = entry.slice(
      colonIndex + 1,
    ) as TriStateValue;
  }
  return result;
}

export function serializeTriStateEntries(values: TriStateValues): string[] {
  return Object.entries(values)
    .filter(([, v]) => v && v !== "na")
    .map(([id, v]) => `${id}:${v}`);
}

interface TriStateListModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  items: readonly ITriStateItemConfig[];
  listingId: number;
  currentValues: string[];
  updateField: keyof IUpdateListingRequestDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function TriStateListModal({
  visible,
  onDismiss,
  title,
  items,
  listingId,
  currentValues,
  updateField,
  onSaved,
}: TriStateListModalProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [values, setValues] = useState<TriStateValues>({});

  useEffect(() => {
    if (visible) {
      setValues(parseTriStateEntries(currentValues));
    }
  }, [visible, currentValues]);

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: value as TriStateValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        { [updateField]: serializeTriStateEntries(values) },
        { method: "PATCH" },
      );
      onSaved(updated);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={commonStyles.borderedRows}>
            {items.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={commonStyles.borderedRowDivider} />}
                <View style={styles.item}>
                  <Text style={commonStyles.itemTitle}>{item.title}</Text>
                  <Text style={[commonStyles.itemSubtext, styles.description]}>
                    {item.description}
                  </Text>
                  <SegmentedButtons
                    value={values[item.id] ?? "na"}
                    onValueChange={(v) => handleChange(item.id, v)}
                    density="small"
                    buttons={[
                      { value: "na", label: "N/A", icon: "minus" },
                      { value: "no", label: "No", icon: "close" },
                      { value: "yes", label: "Yes", icon: "check" },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSave}
          loading={saving}
          showDivider
        />
      </Modal>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    maxHeight: "88%",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.md,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
  },
});
