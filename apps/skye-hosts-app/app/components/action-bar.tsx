import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { colors, commonStyles } from "../theme";

interface ActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
  saveLabel?: string;
  loading?: boolean;
  saveDisabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  showDivider?: boolean;
}

export function ActionBar({
  onCancel,
  onSave,
  onDelete,
  saveLabel = "Save",
  loading,
  saveDisabled,
  containerStyle,
  showDivider = true,
}: ActionBarProps) {
  return (
    <>
      {showDivider && <View style={commonStyles.divider} />}
      <View style={[commonStyles.row, containerStyle]}>
        {onDelete ? (
          <Button
            mode="text"
            onPress={onDelete}
            disabled={loading}
            textColor={colors.danger}
          >
            Delete
          </Button>
        ) : (
          <Button mode="text" onPress={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          mode="contained"
          onPress={onSave}
          loading={loading}
          disabled={loading || saveDisabled}
        >
          {saveLabel}
        </Button>
      </View>
    </>
  );
}
