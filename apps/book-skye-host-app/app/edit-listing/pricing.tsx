import { router } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function PricingScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pricing" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
