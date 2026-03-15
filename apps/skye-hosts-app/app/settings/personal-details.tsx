import type { IGetAccountDetailsResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { EmailModal } from "./components/email-modal";

interface PersonalDetailsItemProps {
  icon: string;
  label: string;
  value: string | null;
  onPress: () => void;
}

function PersonalDetailsItem({
  icon,
  label,
  value,
  onPress,
}: PersonalDetailsItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Icon source={icon} size={22} color={colors.textSecondary} />
      <View style={styles.itemText}>
        <Text style={commonStyles.itemTitle}>{label}</Text>
        {value && <Text style={commonStyles.itemSubtext}>{value}</Text>}
      </View>
      <Icon source="chevron-right" size={22} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const [details, setDetails] = useState<IGetAccountDetailsResponseDto | null>(
    null,
  );
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    const data =
      await fetchApi<IGetAccountDetailsResponseDto>("/account/details");
    setDetails(data);
  }, []);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  function handleEmailVerified(email: string) {
    setDetails((prev) =>
      prev ? { ...prev, email, emailVerified: true } : prev,
    );
  }

  const emailValue = details?.email
    ? details.emailVerified
      ? details.email
      : `${details.email} (unverified)`
    : null;

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Personal details" />
      </Appbar.Header>

      {!details ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <View style={styles.section}>
          <PersonalDetailsItem
            icon="email-outline"
            label="Email"
            value={emailValue}
            onPress={() => setEmailModalVisible(true)}
          />
        </View>
      )}

      <EmailModal
        visible={emailModalVisible}
        currentEmail={details?.email ?? null}
        onDismiss={() => setEmailModalVisible(false)}
        onEmailVerified={handleEmailVerified}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    flex: 1,
    gap: spacing.xs,
  },
});
