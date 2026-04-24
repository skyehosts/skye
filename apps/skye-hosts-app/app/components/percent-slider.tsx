import { useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, typography } from "../theme";

interface PercentSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional tick-mark values to render below the track (e.g. [0, 25, 50, 75, 100]). */
  ticks?: number[];
}

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;
const HIT_HEIGHT = THUMB_SIZE + 16;

export function PercentSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 5,
  ticks,
}: PercentSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    trackWidthRef.current = w;
  };

  const updateFromX = (x: number) => {
    const w = trackWidthRef.current;
    if (w <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / w));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    const clamped = Math.max(min, Math.min(max, snapped));
    if (clamped !== value) onValueChange(clamped);
  };

  const onTouch = (e: GestureResponderEvent) => {
    updateFromX(e.nativeEvent.locationX - THUMB_SIZE / 2);
  };

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const filledWidth = trackWidth * ratio;
  const thumbLeft = filledWidth - THUMB_SIZE / 2;

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.hitArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
      >
        <View style={styles.track} onLayout={onTrackLayout}>
          <View style={[styles.trackFill, { width: filledWidth }]} />
        </View>
        {trackWidth > 0 && (
          <View
            style={[styles.thumb, { left: thumbLeft + THUMB_SIZE / 2 }]}
            pointerEvents="none"
          />
        )}
      </View>
      {ticks && ticks.length > 0 && (
        <View style={styles.tickRow}>
          {ticks.map((tick) => (
            <Text key={tick} style={styles.tickLabel}>
              {tick}%
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  hitArea: {
    height: HIT_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: THUMB_SIZE / 2,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.border,
  },
  trackFill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: "absolute",
    top: (HIT_HEIGHT - THUMB_SIZE) / 2,
    marginLeft: -THUMB_SIZE / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: THUMB_SIZE / 2,
  },
  tickLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
});
