import type { IListingDiscountsDto } from "@repo/common";
import { StyleSheet, Text, View } from "react-native";
import { Switch } from "react-native-paper";
import { NumberStepper } from "../../components/number-stepper";
import { commonStyles, spacing } from "../../theme";

interface DiscountsSectionProps {
  discounts: IListingDiscountsDto;
  onChange: (next: IListingDiscountsDto) => void;
}

export function DiscountsSection({
  discounts,
  onChange,
}: DiscountsSectionProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={commonStyles.sectionTitle}>Discounts</Text>
      <Text style={commonStyles.sectionSubtext}>
        Boost bookings during quieter periods.
      </Text>

      <View style={commonStyles.borderedRows}>
        <DiscountRow
          title="Last-minute"
          description="Applies when check-in is within 14 days"
          enabled={discounts.lastMinuteEnabled}
          percent={discounts.lastMinutePercent}
          onToggle={(v) => onChange({ ...discounts, lastMinuteEnabled: v })}
          onPercentChange={(p) =>
            onChange({ ...discounts, lastMinutePercent: p })
          }
        />
        <View style={commonStyles.borderedRowDivider} />
        <DiscountRow
          title="Weekly"
          description="Applies to 7+ night bookings"
          enabled={discounts.weeklyEnabled}
          percent={discounts.weeklyPercent}
          onToggle={(v) => {
            const next = { ...discounts, weeklyEnabled: v };
            if (v) next.monthlyEnabled = false;
            onChange(next);
          }}
          onPercentChange={(p) => onChange({ ...discounts, weeklyPercent: p })}
        />
        <View style={commonStyles.borderedRowDivider} />
        <DiscountRow
          title="Monthly"
          description="Applies to 28+ night bookings"
          enabled={discounts.monthlyEnabled}
          percent={discounts.monthlyPercent}
          onToggle={(v) => {
            const next = { ...discounts, monthlyEnabled: v };
            if (v) next.weeklyEnabled = false;
            onChange(next);
          }}
          onPercentChange={(p) => onChange({ ...discounts, monthlyPercent: p })}
        />
      </View>
    </View>
  );
}

interface DiscountRowProps {
  title: string;
  description: string;
  enabled: boolean;
  percent: number;
  onToggle: (value: boolean) => void;
  onPercentChange: (value: number) => void;
}

function DiscountRow({
  title,
  description,
  enabled,
  percent,
  onToggle,
  onPercentChange,
}: DiscountRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={commonStyles.itemTitle}>{title}</Text>
          <Text style={commonStyles.itemSubtext}>{description}</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>
      {enabled && (
        <View style={styles.stepperRow}>
          <NumberStepper
            label="Discount %"
            value={percent}
            onChange={onPercentChange}
            min={1}
            max={50}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  stepperRow: {
    paddingTop: spacing.xs,
  },
});
