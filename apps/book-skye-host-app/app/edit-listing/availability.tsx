import { router } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function AvailabilityScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Availability" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
