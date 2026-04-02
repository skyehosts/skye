import {
  TEMPLATE_TOKEN_CATEGORIES,
  type ITemplateToken,
} from "../../../../packages/skye-hosts-api-client/src";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fontWeight, spacing, typography } from "../theme";

interface TemplateTokenPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (token: ITemplateToken) => void;
}

const sections = TEMPLATE_TOKEN_CATEGORIES.filter((c) =>
  c.tokens.some((t) => t.available),
).map((c) => ({
  title: c.title,
  data: c.tokens.filter((t) => t.available),
}));

export function TemplateTokenPicker({
  visible,
  onDismiss,
  onSelect,
}: TemplateTokenPickerProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add details</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Details are shortcuts that are personalised to your guest or listing
          whenever they're used in a message.
        </Text>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.key}-${index}`}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tokenRow}
              onPress={() => {
                onSelect(item);
                onDismiss();
              }}
            >
              <Text style={styles.tokenLabel}>{item.label}</Text>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={colors.primary}
              />
            </Pressable>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tokenLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
});
