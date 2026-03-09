import { router } from "expo-router";
import { Appbar } from "react-native-paper";

interface WizardAppBarProps {
  title: string;
  onBack?: () => void;
}

export function WizardAppBar({ title, onBack }: WizardAppBarProps) {
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={onBack ?? (() => router.back())} />
      <Appbar.Content title={title} />
      <Appbar.Action
        icon="close"
        onPress={() => router.replace("/(tabs)/listings")}
        accessibilityLabel="Exit listing wizard"
      />
    </Appbar.Header>
  );
}
