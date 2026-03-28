import type { IGetAccountDetailsResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Appbar } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { SettingsListItem } from "../components/settings-list-item";
import { fetchApi } from "../services/api";
import { commonStyles } from "../theme";
import { SearchEngineIndexingModal } from "./components/search-engine-indexing-modal";

export default function PrivacyScreen() {
  const router = useRouter();
  const [indexingEnabled, setIndexingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    const data =
      await fetchApi<IGetAccountDetailsResponseDto>("/account/details");
    setIndexingEnabled(data.searchEngineIndexingEnabled);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails]),
  );

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Privacy" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <View style={commonStyles.menuSection}>
          <SettingsListItem
            icon="web"
            label="Include my listing(s) in search engines"
            description="Turning this on means search engines, like Google, will display your listing page(s) in search results."
            onPress={() => setModalVisible(true)}
            actionText="Edit"
          />
        </View>
      )}

      <SearchEngineIndexingModal
        visible={modalVisible}
        currentValue={indexingEnabled}
        onDismiss={() => setModalVisible(false)}
        onChanged={(enabled) => setIndexingEnabled(enabled)}
      />
    </ScreenContainer>
  );
}
