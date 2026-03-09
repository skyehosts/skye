import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";

export default function CalendarScreen() {
  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Calendar" />
      </Appbar.Header>
    </ScreenContainer>
  );
}
