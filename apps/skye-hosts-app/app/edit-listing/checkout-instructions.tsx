import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  CheckoutInstructionId,
  CHECKOUT_INSTRUCTION_OPTIONS,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Button, Modal, Portal, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ActionBar } from "../components/action-bar";
import { AppSnackbar } from "../components/app-snackbar";
import { FormInputModal } from "../components/form-input-modal";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

type CheckoutField = keyof Pick<
  IGetListingResponseDto,
  | "checkoutInstructionTowels"
  | "checkoutInstructionRubbish"
  | "checkoutInstructionTurnThingsOff"
  | "checkoutInstructionLockUp"
  | "checkoutInstructionReturnKeys"
  | "checkoutInstructionAdditions"
>;

export default function CheckoutInstructionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // Edit modal state
  const [editingOption, setEditingOption] = useState<
    (typeof CHECKOUT_INSTRUCTION_OPTIONS)[number] | null
  >(null);

  // Add modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedAddOption, setSelectedAddOption] = useState<
    (typeof CHECKOUT_INSTRUCTION_OPTIONS)[number] | null
  >(null);
  const [addText, setAddText] = useState("");

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
      setListing(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const savedInstructions = CHECKOUT_INSTRUCTION_OPTIONS.filter(
    (opt) => listing?.[opt.field as CheckoutField] != null,
  );

  const availableInstructions = CHECKOUT_INSTRUCTION_OPTIONS.filter(
    (opt) => listing?.[opt.field as CheckoutField] == null,
  );

  const handleEditSave = async (value: string) => {
    if (!editingOption || !listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${id}`,
        { [editingOption.field]: value } as IUpdateListingRequestDto,
        {
          method: "PATCH",
        },
      );
      setListing(updated);
      setEditingOption(null);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDelete = async () => {
    if (!editingOption || !listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${id}`,
        { [editingOption.field]: null } as IUpdateListingRequestDto,
        {
          method: "PATCH",
        },
      );
      setListing(updated);
      setEditingOption(null);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSave = async () => {
    if (!selectedAddOption) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${id}`,
        {
          [selectedAddOption.field]: addText,
        } as IUpdateListingRequestDto,
        {
          method: "PATCH",
        },
      );
      setListing(updated);
      setAddModalVisible(false);
      setSelectedAddOption(null);
      setAddText("");
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setSelectedAddOption(null);
    setAddText("");
    setAddModalVisible(true);
  };

  const selectAddOption = (
    opt: (typeof CHECKOUT_INSTRUCTION_OPTIONS)[number],
  ) => {
    setSelectedAddOption(opt);
    setAddText(
      opt.id === CheckoutInstructionId.Additions ? opt.defaultText : "",
    );
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Checkout instructions" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={commonStyles.bodyText}>
            Explain what&apos;s essential for guests to do before they leave.
            Anyone can read these before they book.
          </Text>

          {savedInstructions.length > 0 && (
            <View style={commonStyles.borderedRows}>
              {savedInstructions.map((opt, index) => (
                <View key={opt.id}>
                  {index > 0 && (
                    <View style={commonStyles.borderedRowDivider} />
                  )}
                  <Pressable
                    style={styles.row}
                    onPress={() => setEditingOption(opt)}
                  >
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={colors.icon}
                    />
                    <View style={styles.rowText}>
                      <Text style={commonStyles.itemTitle}>{opt.title}</Text>
                      {listing?.[opt.field as CheckoutField] ? (
                        <Text
                          style={commonStyles.itemSubtext}
                          numberOfLines={2}
                        >
                          {listing[opt.field as CheckoutField]}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={commonStyles.menuItemAction}>Edit</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {availableInstructions.length > 0 && (
            <Button
              mode="outlined"
              onPress={openAddModal}
              icon="plus"
              style={styles.addButton}
            >
              Add instructions
            </Button>
          )}
        </ScrollView>
      )}

      {/* Edit modal */}
      {editingOption && listing && (
        <FormInputModal
          visible={!!editingOption}
          onDismiss={() => setEditingOption(null)}
          title={editingOption.title}
          value={
            (listing[editingOption.field as CheckoutField] as string) ?? ""
          }
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          maxLength={750}
          loading={saving}
          optional
        />
      )}

      {/* Add modal */}
      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={[commonStyles.modal, styles.addModal]}
        >
          <View style={commonStyles.row}>
            <Text style={commonStyles.modalTitle}>Add instruction</Text>
            <Pressable onPress={() => setAddModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.iconMuted} />
            </Pressable>
          </View>

          {!selectedAddOption ? (
            <View style={styles.optionsList}>
              {availableInstructions.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={styles.optionRow}
                  onPress={() => selectAddOption(opt)}
                >
                  <Ionicons
                    name={opt.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.optionText}>{opt.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.addFormContainer}>
              <View style={styles.selectedHeader}>
                <Ionicons
                  name={
                    selectedAddOption.icon as keyof typeof Ionicons.glyphMap
                  }
                  size={20}
                  color={colors.textPrimary}
                />
                <Text style={commonStyles.itemTitle}>
                  {selectedAddOption.title}
                </Text>
                <Pressable
                  onPress={() => setSelectedAddOption(null)}
                  hitSlop={8}
                >
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              </View>

              <TextInput
                mode="outlined"
                value={addText}
                onChangeText={setAddText}
                multiline
                style={styles.textInput}
                contentStyle={commonStyles.multilineInput}
                disabled={saving}
                placeholder={
                  selectedAddOption.id !== CheckoutInstructionId.Additions
                    ? selectedAddOption.defaultText
                    : undefined
                }
              />

              <Text style={commonStyles.itemSubtext}>
                {750 - addText.length} characters available
              </Text>

              <ActionBar
                onCancel={() => setAddModalVisible(false)}
                onSave={handleAddSave}
                loading={saving}
                saveDisabled={false}
              />
            </View>
          )}
        </Modal>
      </Portal>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  addButton: {
    alignSelf: "flex-start",
  },
  addModal: {
    maxHeight: "80%",
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  optionText: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  addFormContainer: {
    gap: spacing.md,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  changeText: {
    fontSize: typography.sm,
    color: colors.messageSent,
    marginLeft: "auto",
  },
  textInput: {
    maxHeight: 200,
  },
});
