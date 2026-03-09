import { router } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function EditPhotosScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit photos" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
