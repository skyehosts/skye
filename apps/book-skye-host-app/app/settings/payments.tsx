import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { commonStyles } from "../theme";

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Payments" />
      </Appbar.Header>

      <View style={commonStyles.content}>
        <Text style={commonStyles.sectionSubtext}>
          Payments settings coming soon.
        </Text>
      </View>
    </ScreenContainer>
  );
}
