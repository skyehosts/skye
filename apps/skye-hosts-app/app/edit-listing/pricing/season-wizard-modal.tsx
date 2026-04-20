import { PRICING_SEASON_LABELS, type PricingSeasonId } from "@repo/common";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import { PriceInput } from "../../components/price-input";
import { colors, commonStyles, spacing, typography } from "../../theme";
import { GuestPriceBreakdown } from "./guest-price-breakdown";

interface SeasonWizardModalProps {
  visible: boolean;
  season: PricingSeasonId;
  initialWeekdayPence: number;
  initialWeekendPence: number;
  onCancel: () => void;
  onSave: (weekdayPence: number, weekendPence: number) => Promise<void>;
}

type Stage = "weekday" | "weekend";
type WeekendMode = "percent" | "absolute";

export function SeasonWizardModal({
  visible,
  season,
  initialWeekdayPence,
  initialWeekendPence,
  onCancel,
  onSave,
}: SeasonWizardModalProps) {
  const [stage, setStage] = useState<Stage>("weekday");
  const [weekdayPence, setWeekdayPence] = useState(initialWeekdayPence);
  const [weekendPence, setWeekendPence] = useState(initialWeekendPence);
  const [weekendMode, setWeekendMode] = useState<WeekendMode>("absolute");
  const [weekendPercent, setWeekendPercent] = useState(
    initialWeekdayPence > 0
      ? Math.max(
          0,
          Math.round(
            ((initialWeekendPence - initialWeekdayPence) /
              initialWeekdayPence) *
              100,
          ),
        )
      : 0,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setStage("weekday");
      setWeekdayPence(initialWeekdayPence);
      setWeekendPence(initialWeekendPence);
      setWeekendPercent(
        initialWeekdayPence > 0
          ? Math.max(
              0,
              Math.round(
                ((initialWeekendPence - initialWeekdayPence) /
                  initialWeekdayPence) *
                  100,
              ),
            )
          : 0,
      );
    }
  }, [visible, initialWeekdayPence, initialWeekendPence]);

  const effectiveWeekendPence =
    weekendMode === "percent"
      ? Math.round(weekdayPence * (1 + weekendPercent / 100))
      : weekendPence;

  const handleNext = () => {
    if (weekdayPence <= 0) return;
    if (weekendPence <= 0 || weekendPence < weekdayPence) {
      setWeekendPence(weekdayPence);
    }
    setStage("weekend");
  };

  const handleSave = async () => {
    if (effectiveWeekendPence <= 0) return;
    setSaving(true);
    try {
      await onSave(weekdayPence, effectiveWeekendPence);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onCancel}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={stage === "weekday" ? onCancel : () => setStage("weekday")}
          />
          <Appbar.Content title={PRICING_SEASON_LABELS[season]} />
          <Appbar.Action icon="close" onPress={onCancel} />
        </Appbar.Header>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {stage === "weekday" ? (
            <>
              <Text style={styles.stageTitle}>Weekday price</Text>
              <Text style={styles.stageSubtext}>
                The price you receive per night on Sun–Thu.
              </Text>
              <PriceInput
                valuePence={weekdayPence}
                onChangePence={setWeekdayPence}
                autoFocus
              />
              <GuestPriceBreakdown hostNetPence={weekdayPence} />
            </>
          ) : (
            <>
              <Text style={styles.stageTitle}>Weekend price</Text>
              <Text style={styles.stageSubtext}>
                The price you receive per night on Fri and Sat.
              </Text>

              <View style={styles.toggleRow}>
                <Pressable
                  style={[
                    styles.toggle,
                    weekendMode === "percent" && styles.toggleActive,
                  ]}
                  onPress={() => setWeekendMode("percent")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      weekendMode === "percent" && styles.toggleTextActive,
                    ]}
                  >
                    % over weekday
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggle,
                    weekendMode === "absolute" && styles.toggleActive,
                  ]}
                  onPress={() => setWeekendMode("absolute")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      weekendMode === "absolute" && styles.toggleTextActive,
                    ]}
                  >
                    Set directly
                  </Text>
                </Pressable>
              </View>

              {weekendMode === "percent" ? (
                <View style={styles.percentPanel}>
                  <View style={styles.percentRow}>
                    <Pressable
                      onPress={() =>
                        setWeekendPercent(Math.max(0, weekendPercent - 5))
                      }
                      style={styles.percentButton}
                    >
                      <Text style={styles.percentButtonText}>−5</Text>
                    </Pressable>
                    <Text style={styles.percentValue}>{weekendPercent}%</Text>
                    <Pressable
                      onPress={() =>
                        setWeekendPercent(Math.min(200, weekendPercent + 5))
                      }
                      style={styles.percentButton}
                    >
                      <Text style={styles.percentButtonText}>+5</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.computedText}>
                    = £{(effectiveWeekendPence / 100).toFixed(2)} per weekend
                    night
                  </Text>
                </View>
              ) : (
                <PriceInput
                  valuePence={weekendPence}
                  onChangePence={setWeekendPence}
                  autoFocus
                />
              )}

              <GuestPriceBreakdown hostNetPence={effectiveWeekendPence} />
            </>
          )}
        </ScrollView>

        <View style={commonStyles.footer}>
          <Button
            mode="text"
            onPress={stage === "weekday" ? onCancel : () => setStage("weekday")}
            disabled={saving}
          >
            {stage === "weekday" ? "Cancel" : "Back"}
          </Button>
          {stage === "weekday" ? (
            <Button
              mode="contained"
              onPress={handleNext}
              disabled={weekdayPence <= 0}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving || effectiveWeekendPence <= 0}
            >
              Save
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stageTitle: {
    fontSize: typography.xl,
    color: colors.textPrimary,
    textAlign: "center",
  },
  stageSubtext: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toggle: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  toggleText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  percentPanel: {
    gap: spacing.sm,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  percentButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  percentButtonText: {
    fontSize: typography.md,
    color: colors.primary,
  },
  percentValue: {
    fontSize: typography.xl,
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: "center",
  },
  computedText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
