import type {
  IGetListingResponseDto,
  IMinNightsByCheckInDay,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { NumberStepper } from "../components/number-stepper";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { handleApiError } from "../utils/form-error-handler";

const DAY_LABELS: { key: keyof IMinNightsByCheckInDay; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function makePerDayValues(defaultValue: number): IMinNightsByCheckInDay {
  return {
    monday: defaultValue,
    tuesday: defaultValue,
    wednesday: defaultValue,
    thursday: defaultValue,
    friday: defaultValue,
    saturday: defaultValue,
    sunday: defaultValue,
  };
}

interface MinNightsModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function MinNightsModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: MinNightsModalProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [simpleValue, setSimpleValue] = useState(1);
  const [perDayValues, setPerDayValues] = useState<IMinNightsByCheckInDay>(
    makePerDayValues(1),
  );

  useEffect(() => {
    if (visible) {
      setSimpleValue(listing.minNights);
      setIsCustomMode(listing.minNightsByCheckInDay !== null);
      setPerDayValues(
        listing.minNightsByCheckInDay ?? makePerDayValues(listing.minNights),
      );
    }
  }, [visible, listing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: IUpdateListingRequestDto = isCustomMode
        ? { minNightsByCheckInDay: perDayValues }
        : { minNights: simpleValue, minNightsByCheckInDay: null };

      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(`/listing/${listing.id}`, body, { method: "PATCH" });
      onSaved(updated);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchToCustom = () => {
    setPerDayValues(
      listing.minNightsByCheckInDay ?? makePerDayValues(simpleValue),
    );
    setIsCustomMode(true);
  };

  const updateDay = (day: keyof IMinNightsByCheckInDay, value: number) => {
    setPerDayValues((prev) => ({ ...prev, [day]: value }));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Minimum nights</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        {isCustomMode ? (
          <>
            <Text style={styles.subtitle}>
              Set different minimums based on which day guests check in.
            </Text>

            <ScrollView style={styles.scrollArea}>
              <View style={commonStyles.borderedRows}>
                {DAY_LABELS.map(({ key, label }, index) => (
                  <View key={key}>
                    {index > 0 && (
                      <View style={commonStyles.borderedRowDivider} />
                    )}
                    <View
                      style={[
                        commonStyles.borderedRow,
                        { paddingVertical: spacing.xs },
                      ]}
                    >
                      <NumberStepper
                        label={label}
                        value={perDayValues[key]}
                        onChange={(v) => updateDay(key, v)}
                        min={1}
                        max={30}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setIsCustomMode(false)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>Use same for all days</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Set the shortest stay guests can book. Applies to all check-in
              days.
            </Text>

            <View style={commonStyles.borderedRows}>
              <View style={commonStyles.borderedRow}>
                <NumberStepper
                  label="Minimum nights"
                  value={simpleValue}
                  onChange={setSimpleValue}
                  min={1}
                  max={30}
                />
              </View>
            </View>

            <Pressable
              onPress={handleSwitchToCustom}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>Customise by check-in day</Text>
            </Pressable>
          </>
        )}

        <View style={commonStyles.divider} />

        <View style={commonStyles.row}>
          <Button mode="text" onPress={onDismiss} disabled={saving}>
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
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  scrollArea: {
    maxHeight: 360,
  },
  toggleButton: {
    paddingVertical: spacing.md,
    alignSelf: "center",
  },
  toggleText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
