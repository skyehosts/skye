import {
  toDateString,
  type IDeleteOverridesRequestDto,
  type IUpsertOverridesRequestDto,
} from "@repo/common";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { ActionBar } from "../../components/action-bar";
import { PriceInput } from "../../components/price-input";
import { GuestPriceBreakdown } from "../../edit-listing/pricing/guest-price-breakdown";
import { fetchApi } from "../../services/api";
import { captureException } from "../../services/error-reporting";
import { borderRadius, colors, spacing, typography } from "../../theme";

interface PriceOverrideModalProps {
  visible: boolean;
  listingId: string;
  /** Inclusive start date YYYY-MM-DD */
  startDate: string;
  /** Exclusive end date YYYY-MM-DD (iCal DTEND) */
  endDate: string;
  /** List of dates in the range that already have overrides */
  existingOverrideDates: string[];
  onDismiss: () => void;
  onSaved: () => void;
}

function expandDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cur = parseISO(startDate);
  const stop = parseISO(endDate);
  while (cur < stop) {
    dates.push(toDateString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  end.setDate(end.getDate() - 1);
  const startStr = format(start, "d MMM");
  const endStr = format(end, "d MMM yyyy");
  const diff = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1,
  );
  if (diff === 1) return `${startStr} ${start.getFullYear()} (1 night)`;
  return `${startStr} – ${endStr} (${diff} nights)`;
}

export function PriceOverrideModal({
  visible,
  listingId,
  startDate,
  endDate,
  existingOverrideDates,
  onDismiss,
  onSaved,
}: PriceOverrideModalProps) {
  const [pricePence, setPricePence] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setPricePence(0);
      setError("");
    }
  }, [visible]);

  const hasExisting = existingOverrideDates.length > 0;
  const dates = expandDates(startDate, endDate);

  const handleSave = async () => {
    if (pricePence <= 0) return;
    setSaving(true);
    setError("");
    try {
      const body: IUpsertOverridesRequestDto = { dates, pricePence };
      await fetchApi(`/listing/${listingId}/overrides`, body, {
        method: "PUT",
      });
      onSaved();
    } catch (e) {
      captureException(e);
      setError("Failed to save override. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError("");
    try {
      const body: IDeleteOverridesRequestDto = {
        dates: existingOverrideDates,
      };
      await fetchApi(`/listing/${listingId}/overrides`, body, {
        method: "DELETE",
      });
      onSaved();
    } catch (e) {
      captureException(e);
      setError("Failed to remove override. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={saving ? () => {} : onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.title}>Set price override</Text>
        <Text style={styles.subtitle}>{formatRange(startDate, endDate)}</Text>

        <PriceInput
          valuePence={pricePence}
          onChangePence={setPricePence}
          autoFocus
          label="Your price per night (override)"
        />

        {pricePence > 0 && <GuestPriceBreakdown hostNetPence={pricePence} />}

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        <ActionBar
          onCancel={onDismiss}
          onSave={handleSave}
          onDelete={hasExisting ? handleRemove : undefined}
          loading={saving}
          saveDisabled={pricePence <= 0}
          saveLabel="Save"
          showDivider={false}
        />
      </Modal>
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
  },
  title: {
    fontSize: typography.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  error: {
    fontSize: typography.sm,
    color: colors.danger,
  },
});
