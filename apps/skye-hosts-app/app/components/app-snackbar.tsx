import { Portal, Snackbar } from "react-native-paper";
import { colors } from "../theme";

interface AppSnackbarProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
  type?: "error" | "success";
}

export function AppSnackbar({
  message,
  onDismiss,
  duration = 4000,
  type = "error",
}: AppSnackbarProps) {
  return (
    <Portal>
      <Snackbar
        visible={!!message}
        onDismiss={onDismiss}
        duration={duration}
        style={
          type === "success"
            ? { backgroundColor: colors.success }
            : { backgroundColor: colors.dangerBackground }
        }
        action={{ label: "Dismiss", onPress: onDismiss }}
      >
        {message}
      </Snackbar>
    </Portal>
  );
}
