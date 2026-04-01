import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import {
  borderRadius,
  colors,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { createLogger } from "../services/logger";

const logger = createLogger("LocationPinPicker");

interface LocationPinPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

const ISLE_OF_SKYE_DELTA = { latitudeDelta: 0.002, longitudeDelta: 0.002 };

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.debug("Map error boundary caught error", {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Map failed to load</Text>
          <Text style={errorStyles.detail}>{this.state.error.message}</Text>
          <Text style={errorStyles.stack}>
            {this.state.error.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  title: {
    fontSize: typography.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  detail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stack: { fontSize: 10, color: colors.textSecondary },
});

function LocationPinPickerInner({
  initialLatitude,
  initialLongitude,
  onLocationChange,
}: LocationPinPickerProps) {
  const [showMarker, setShowMarker] = useState(false);
  const mapRef = useRef<MapView>(null);

  const initialRegion: Region = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    ...ISLE_OF_SKYE_DELTA,
  };

  const handleMapReady = useCallback(() => {
    setShowMarker(true);
  }, []);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType="hybrid"
        onMapReady={handleMapReady}
      >
        {showMarker && (
          <Marker
            coordinate={{
              latitude: initialLatitude,
              longitude: initialLongitude,
            }}
            draggable
            onDragEnd={handleDragEnd}
          />
        )}
      </MapView>
    </View>
  );
}

export function LocationPinPicker(props: LocationPinPickerProps) {
  return (
    <MapErrorBoundary>
      <LocationPinPickerInner {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  map: {
    flex: 1,
  },
});
