import { Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";
import { colors, commonStyles } from "../theme";

interface SettingsListItemProps {
  icon: string;
  label: string;
  value?: string | null;
  description?: string;
  onPress: () => void;
  actionText?: string;
}

export function SettingsListItem({
  icon,
  label,
  value,
  description,
  onPress,
  actionText,
}: SettingsListItemProps) {
  return (
    <TouchableOpacity style={commonStyles.menuItem} onPress={onPress}>
      <Icon source={icon} size={22} color={colors.icon} />
      <View style={commonStyles.menuItemText}>
        <Text style={commonStyles.itemTitle}>{label}</Text>
        {value && <Text style={commonStyles.itemSubtext}>{value}</Text>}
        {description && (
          <Text style={commonStyles.itemSubtext}>{description}</Text>
        )}
      </View>
      {actionText ? (
        <Text style={commonStyles.menuItemAction}>{actionText}</Text>
      ) : (
        <Icon source="chevron-right" size={22} color={colors.icon} />
      )}
    </TouchableOpacity>
  );
}
