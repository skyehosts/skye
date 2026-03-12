import { StyleSheet, View } from "react-native";
import { DropdownField } from "./dropdown-field";
import { spacing } from "../theme";

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

export const TIME_OPTIONS = generateTimeOptions();
export const DEFAULT_TIME = "12:00";

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartChange: (time: string) => void;
  onEndChange: (time: string) => void;
  startLabel?: string;
  endLabel?: string;
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  startLabel = "Start time",
  endLabel = "End time",
}: TimeRangePickerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.half}>
        <DropdownField
          label={startLabel}
          value={startTime}
          options={TIME_OPTIONS}
          onChange={onStartChange}
        />
      </View>
      <View style={styles.half}>
        <DropdownField
          label={endLabel}
          value={endTime}
          options={TIME_OPTIONS}
          onChange={onEndChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});
