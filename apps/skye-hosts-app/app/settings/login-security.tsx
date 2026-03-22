import { useRouter } from "expo-router";
import { View } from "react-native";
import { Appbar } from "react-native-paper";
import { MenuItem } from "../components/menu-item";
import { ScreenContainer } from "../components/screen-container";
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
        <MenuItem
          icon="lock-reset"
          label="Change PIN"
          onPress={() => router.push("/settings/change-pin")}
        />
      </View>
    </ScreenContainer>
  );
}
