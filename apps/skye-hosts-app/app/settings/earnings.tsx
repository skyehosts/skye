import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function EarningsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Earnings" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
