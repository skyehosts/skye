import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, commonStyles } from "../theme";

interface ShortTermLetRowProps {
  onPress: () => void;
}

export function ShortTermLetRow({ onPress }: ShortTermLetRowProps) {
  return (
    <Pressable style={commonStyles.borderedRowContent} onPress={onPress}>
      <View style={commonStyles.borderedRowText}>
        <Text style={commonStyles.itemTitle}>
          Highland council short-term let laws
        </Text>
        <Text style={commonStyles.itemSubtext}>
          It is required to confirm you have a short-term let license.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.icon} />
    </Pressable>
  );
}
