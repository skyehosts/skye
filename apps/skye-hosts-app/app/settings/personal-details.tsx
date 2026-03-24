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
import { PhoneModal } from "./components/phone-modal";

interface PersonalDetailsItemProps {
  icon: string;
  label: string;
  value: string | null;
  description?: string;
  onPress: () => void;
  actionText?: string;
}

function PersonalDetailsItem({
  icon,
  label,
  value,
  description,
  onPress,
  actionText,
}: PersonalDetailsItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Icon source={icon} size={22} color={colors.textSecondary} />
      <View style={styles.itemText}>
        <Text style={commonStyles.itemTitle}>{label}</Text>
        {value && <Text style={commonStyles.itemSubtext}>{value}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {actionText ? (
        <Text style={styles.actionText}>{actionText}</Text>
      ) : (
        <Icon source="chevron-right" size={22} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

function maskPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 5) return phoneNumber;
  return `${digits.slice(0, 2)}******${digits.slice(-3)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length < 2) return email;
  return `${local.slice(0, 2)}****@${domain}`;
}

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const [details, setDetails] = useState<IGetAccountDetailsResponseDto | null>(
    null,
  );
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    const data =
      await fetchApi<IGetAccountDetailsResponseDto>("/account/details");
    setDetails(data);
  }, []);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  function handleEmailVerified(email: string) {
    setDetails((prev) => (prev ? { ...prev, email } : prev));
  }

  function handlePhoneChanged(phoneNumber: string) {
    setDetails((prev) => (prev ? { ...prev, phoneNumber } : prev));
  }

  const email = details?.email ?? null;
  const phoneNumber = details?.phoneNumber ?? null;
  const maskedPhone = phoneNumber ? maskPhoneNumber(phoneNumber) : null;
  const maskedEmail = email ? maskEmail(email) : null;
  const phoneDescription = maskedPhone
    ? `${maskedPhone}\nContact number (for confirmed guests and Skye Hosts to get in touch)`
    : "Contact number (for confirmed guests and Skye Hosts to get in touch)";
  const emailDescription = maskedEmail
    ? `${maskedEmail}\nUsed for booking notifications and account updates`
    : "No email added — Optional, useful for booking notifications and account updates";

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
            value={null}
            description={emailDescription}
            onPress={() => setEmailModalVisible(true)}
            actionText="Edit"
          />
          <PersonalDetailsItem
            icon="phone-outline"
            label="Phone number"
            value={null}
            description={phoneDescription}
            onPress={() => setPhoneModalVisible(true)}
            actionText="Edit"
          />
        </View>
      )}

      <EmailModal
        visible={emailModalVisible}
        currentEmail={details?.email ?? null}
        onDismiss={() => setEmailModalVisible(false)}
        onEmailVerified={handleEmailVerified}
      />
      <PhoneModal
        visible={phoneModalVisible}
        onDismiss={() => setPhoneModalVisible(false)}
        onPhoneChanged={handlePhoneChanged}
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
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  actionText: {
    fontSize: typography.sm,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
