import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function ShareScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Share" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
