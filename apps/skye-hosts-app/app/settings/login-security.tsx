import { useRouter } from "expo-router";
import { View } from "react-native";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { SettingsListItem } from "../components/settings-list-item";
import { commonStyles } from "../theme";

export default function LoginSecurityScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Login & Security" />
      </Appbar.Header>

      <View style={commonStyles.menuSection}>
        <SettingsListItem
          icon="lock-reset"
          label="Pin number"
          description="Change or update your 4-6 digit security PIN"
          onPress={() => router.push("/settings/change-pin")}
          actionText="Edit"
        />
      </View>
    </ScreenContainer>
  );
}
