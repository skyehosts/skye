import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppSnackbar } from "../../components/app-snackbar";
import { DropdownField } from "../../components/dropdown-field";
import { ActionBar } from "../../components/action-bar";
import {
  DEFAULT_TIME,
  TIME_OPTIONS,
  TimeRangePicker,
} from "../../components/time-range-picker";
import { fetchApi } from "../../services/api";
import { colors, commonStyles, spacing } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

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
      handleApiError(e, setServerError);
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
              <Ionicons name="close" size={22} color={colors.iconMuted} />
            </Pressable>
          </View>

          <Text style={commonStyles.itemTitle}>Check-in window</Text>
          <TimeRangePicker
            startTime={checkInStart}
            endTime={checkInEnd}
            onStartChange={setCheckInStart}
            onEndChange={setCheckInEnd}
          />

          <Text style={commonStyles.itemTitle}>Checkout time</Text>
          <DropdownField
            label="Select time"
            value={checkOut}
            options={TIME_OPTIONS}
            onChange={setCheckOut}
          />

          <ActionBar
            onCancel={() => setModalVisible(false)}
            onSave={handleSave}
            loading={saving}
          />
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
});
