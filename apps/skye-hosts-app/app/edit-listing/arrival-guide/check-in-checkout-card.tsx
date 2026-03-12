import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppSnackbar } from "../../components/app-snackbar";
import { DropdownField } from "../../components/dropdown-field";
import { fetchApi } from "../../services/api";
import { colors, commonStyles, spacing } from "../../theme";
import { handleFormError } from "../../utils/form-error-handler";

function generateTimeOptions(): { value: string; label: string }[] {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const value = `${hh}:${mm}`;
      times.push({ value, label: value });
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();
const DEFAULT_TIME = "12:00";

interface CheckInCheckoutCardProps {
  listingId: string;
  checkInTimeStart?: string | null;
  checkInTimeEnd?: string | null;
  checkOutTime?: string | null;
  onUpdate: (updated: IGetListingResponseDto) => void;
}

export function CheckInCheckoutCard({
  listingId,
  checkInTimeStart,
  checkInTimeEnd,
  checkOutTime,
  onUpdate,
}: CheckInCheckoutCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [checkInStart, setCheckInStart] = useState<string>(DEFAULT_TIME);
  const [checkInEnd, setCheckInEnd] = useState<string>(DEFAULT_TIME);
  const [checkOut, setCheckOut] = useState<string>(DEFAULT_TIME);
  const { setError } = useForm();

  useEffect(() => {
    if (modalVisible) {
      setCheckInStart(checkInTimeStart ?? DEFAULT_TIME);
      setCheckInEnd(checkInTimeEnd ?? DEFAULT_TIME);
      setCheckOut(checkOutTime ?? DEFAULT_TIME);
    }
  }, [modalVisible, checkInTimeStart, checkInTimeEnd, checkOutTime]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listingId}`,
        {
          checkInTimeStart: checkInStart,
          checkInTimeEnd: checkInEnd,
          checkOutTime: checkOut,
        },
        { method: "PATCH" },
      );
      onUpdate(updated);
      setModalVisible(false);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const checkInDisplay =
    checkInTimeStart && checkInTimeEnd
      ? `${checkInTimeStart} – ${checkInTimeEnd}`
      : "Not set";

  const checkOutDisplay = checkOutTime ?? "Not set";

  return (
    <>
      <Pressable
        style={[commonStyles.card, styles.splitCard]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.splitSide}>
          <Text style={commonStyles.itemTitle}>Check-in</Text>
          <Text style={commonStyles.itemSubtext}>{checkInDisplay}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.splitSide}>
          <Text style={commonStyles.itemTitle}>Checkout</Text>
          <Text style={commonStyles.itemSubtext}>{checkOutDisplay}</Text>
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={commonStyles.modal}
        >
          <View style={commonStyles.row}>
            <Text style={commonStyles.modalTitle}>
              Check-in & checkout times
            </Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={commonStyles.itemTitle}>Check-in window</Text>
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownHalf}>
              <DropdownField
                label="Start time"
                value={checkInStart}
                options={TIME_OPTIONS}
                onChange={setCheckInStart}
              />
            </View>
            <View style={styles.dropdownHalf}>
              <DropdownField
                label="End time"
                value={checkInEnd}
                options={TIME_OPTIONS}
                onChange={setCheckInEnd}
              />
            </View>
          </View>

          <Text style={commonStyles.itemTitle}>Checkout time</Text>
          <DropdownField
            label="Select time"
            value={checkOut}
            options={TIME_OPTIONS}
            onChange={setCheckOut}
          />

          <View style={commonStyles.divider} />

          <View style={commonStyles.row}>
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </>
  );
}

const styles = StyleSheet.create({
  splitCard: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  splitSide: {
    flex: 1,
    gap: spacing.xs,
  },
  separator: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  dropdownRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dropdownHalf: {
    flex: 1,
  },
});
