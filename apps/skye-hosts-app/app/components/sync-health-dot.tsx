import { View, type StyleProp, type ViewStyle } from "react-native";

interface SyncHealthDotProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function SyncHealthDot({ color, size = 10, style }: SyncHealthDotProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
