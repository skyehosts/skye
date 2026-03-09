import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function TodayScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Today" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
