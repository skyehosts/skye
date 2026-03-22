import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { borderRadius, colors, spacing } from "../theme";

interface LocationPinPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

const ISLE_OF_SKYE_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function LocationPinPicker({
  initialLatitude,
  initialLongitude,
  onLocationChange,
}: LocationPinPickerProps) {
  const initialRegion: Region = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    ...ISLE_OF_SKYE_DELTA,
  };

  const handleDragEnd = useCallback(
    (e: {
      nativeEvent: { coordinate: { latitude: number; longitude: number } };
    }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      onLocationChange(latitude, longitude);
    },
    [onLocationChange],
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={{
            latitude: initialLatitude,
            longitude: initialLongitude,
          }}
          draggable
          onDragEnd={handleDragEnd}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  map: {
    width: "100%",
    height: 300,
  },
});
