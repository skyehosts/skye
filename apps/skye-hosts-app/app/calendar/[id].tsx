import { useLocalSearchParams, useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { CalendarList } from "./components/calendar-list";

export default function CalendarDetailScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ id: string; title: string }>();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title ?? "Calendar"} />
        <Appbar.Action icon="calendar-month" onPress={() => {}} />
      </Appbar.Header>
      <CalendarList />
    </ScreenContainer>
  );
}
