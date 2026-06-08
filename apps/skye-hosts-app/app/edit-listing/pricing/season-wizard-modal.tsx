import {
  formatGbp,
  parseGbpToPence,
  PRICING_SEASON_LABELS,
  type PricingSeasonId,
} from "@repo/common";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { HeroPriceInput } from "../../components/hero-price-input";
import { InfoBox } from "../../components/info-box";
import { PercentSlider } from "../../components/percent-slider";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../../theme";
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

const PREMIUM_MIN = 0;
const PREMIUM_MAX = 100;
const PREMIUM_STEP = 5;
const DEFAULT_PREMIUM = 20;
const PREMIUM_TICKS = [0, 25, 50, 75, 100];

function computeInitialPremium(
  initialWeekdayPence: number,
  initialWeekendPence: number,
): number {
  if (initialWeekdayPence <= 0) return DEFAULT_PREMIUM;
  if (initialWeekendPence <= 0) return DEFAULT_PREMIUM;
  const raw =
    ((initialWeekendPence - initialWeekdayPence) / initialWeekdayPence) * 100;
  const snapped = Math.round(raw / PREMIUM_STEP) * PREMIUM_STEP;
  return Math.max(PREMIUM_MIN, Math.min(PREMIUM_MAX, snapped));
}

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
  const [weekendPercent, setWeekendPercent] = useState(
    computeInitialPremium(initialWeekdayPence, initialWeekendPence),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setStage("weekday");
      setWeekdayPence(initialWeekdayPence);
      setWeekendPercent(
        computeInitialPremium(initialWeekdayPence, initialWeekendPence),
      );
    }
  }, [visible, initialWeekdayPence, initialWeekendPence]);

  const weekendPence = Math.round(weekdayPence * (1 + weekendPercent / 100));

  const handleNext = () => {
    if (weekdayPence <= 0) return;
    setStage("weekend");
  };

  const handleSave = async () => {
    if (weekendPence <= 0) return;
    setSaving(true);
    try {
      await onSave(weekdayPence, weekendPence);
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
              <Text style={styles.stageTitle}>Set a weekday price</Text>
              <Text style={styles.stageSubtext}>
                The amount you&apos;ll receive per night (after fees), Sunday to
                Thursday.
              </Text>
              <HeroPriceInput
                value={weekdayPence === 0 ? "" : formatGbp(weekdayPence)}
                onChangeText={(t) => setWeekdayPence(parseGbpToPence(t))}
                maxLength={7}
              />
              <GuestPriceBreakdown hostNetPence={weekdayPence} />
              <InfoBox variant="info">
                We recommend setting your price ~7% higher than your Airbnb net
                — you earn more, guests still pay less.
              </InfoBox>
            </>
          ) : (
            <>
              <Text style={styles.stageTitle}>Set a weekend price</Text>
              <Text style={styles.stageSubtext}>
                Add a premium for Fridays and Saturdays. Price shown is after
                fees.
              </Text>

              <Text style={styles.bigPrice}>{formatGbp(weekendPence)}</Text>

              <GuestPriceBreakdown hostNetPence={weekendPence} />

              <View style={styles.premiumSection}>
                <View style={styles.premiumHeader}>
                  <Text style={styles.premiumLabel}>Weekend premium</Text>
                  <Text style={styles.premiumValue}>+{weekendPercent}%</Text>
                </View>
                <PercentSlider
                  value={weekendPercent}
                  onValueChange={setWeekendPercent}
                  min={PREMIUM_MIN}
                  max={PREMIUM_MAX}
                  step={PREMIUM_STEP}
                  ticks={PREMIUM_TICKS}
                />
                <Text style={styles.premiumHelper}>
                  Uplift over your weekday rate of {formatGbp(weekdayPence)}.
                </Text>
              </View>
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
              disabled={saving || weekendPence <= 0}
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
  bigPrice: {
    fontSize: typography.display,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: -spacing.md,
  },
  premiumSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  premiumValue: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  premiumHelper: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
