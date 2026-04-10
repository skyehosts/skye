import type {
  IGetHostListingsResponseDto,
  IGetMessageTemplatesResponseDto,
  IMessageTemplateDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { TRIGGER_TYPE_LABELS } from "../../../../packages/skye-hosts-api-client/src";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Button, Chip, Icon } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";

const MAX_CHIP_LENGTH = 22;

function truncate(str: string): string {
  return str.length > MAX_CHIP_LENGTH
    ? str.slice(0, MAX_CHIP_LENGTH) + "…"
    : str;
}

export default function MessageTemplatesScreen() {
  const router = useRouter();
  const { flash } = useLocalSearchParams<{ flash?: string }>();
  const [templates, setTemplates] = useState<IMessageTemplateDto[]>([]);
  const [listingMap, setListingMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState("");

  useEffect(() => {
    if (flash) {
      setFlashMessage(flash);
      router.setParams({ flash: undefined });
    }
  }, [flash, router]);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [templatesData, listingsData] = await Promise.all([
        fetchApi<IGetMessageTemplatesResponseDto>("/message-template"),
        fetchApi<IGetHostListingsResponseDto>("/listing"),
      ]);
      setTemplates(templatesData.templates);
      setListingMap(
        Object.fromEntries(listingsData.listings.map((l) => [l.id, l.title])),
      );
    } catch {
      setError("Failed to load scheduled messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates]),
  );

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Scheduled messages" />
        <Appbar.Action
          icon="plus"
          onPress={() => router.push("/message-templates/new")}
        />
      </Appbar.Header>

      {isLoading && (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={loadTemplates}>
            Retry
          </Button>
        </View>
      )}

      {!isLoading && !error && templates.length === 0 && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.emptyText}>No scheduled messages yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Create a scheduled message to automatically message guests.
          </Text>
          <Button
            mode="contained"
            style={styles.ctaButton}
            onPress={() => router.push("/message-templates/new")}
          >
            Create scheduled message
          </Button>
        </View>
      )}

      {!isLoading && !error && templates.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              listingMap={listingMap}
              onPress={() =>
                router.push(`/message-templates/${template.id}` as never)
              }
            />
          ))}
        </ScrollView>
      )}

      <AppSnackbar
        message={flashMessage}
        onDismiss={() => setFlashMessage("")}
        type="success"
      />
    </ScreenContainer>
  );
}

function TemplateCard({
  template,
  listingMap,
  onPress,
}: {
  template: IMessageTemplateDto;
  listingMap: Record<number, string>;
  onPress: () => void;
}) {
  const trigger = template.triggers[0];
  const triggerLabel = trigger
    ? TRIGGER_TYPE_LABELS[trigger.triggerType]
    : null;

  const firstListingId = template.listingIds[0];
  const firstListingTitle = firstListingId ? listingMap[firstListingId] : null;
  const extraListings = template.listingIds.length - 1;

  return (
    <Pressable style={[commonStyles.card, styles.card]} onPress={onPress}>
      <View style={commonStyles.row}>
        <View style={styles.cardBody}>
          <Text style={commonStyles.itemTitle}>{template.name}</Text>

          {triggerLabel && (
            <View style={styles.metadataRow}>
              <Text style={styles.label}>Sends on:</Text>
              <Chip
                compact
                style={commonStyles.chip}
                textStyle={styles.chipText}
              >
                {triggerLabel}
              </Chip>
            </View>
          )}

          {firstListingTitle && (
            <View style={styles.metadataRow}>
              <Text style={styles.label}>
                {template.listingIds.length === 1 ? "Listing:" : "Listings:"}
              </Text>
              <Chip
                compact
                style={commonStyles.chip}
                textStyle={styles.chipText}
              >
                {truncate(firstListingTitle)}
              </Chip>
              {extraListings > 0 && (
                <Text style={styles.moreText}>
                  + {extraListings} {extraListings === 1 ? "other" : "others"}
                </Text>
              )}
            </View>
          )}
        </View>

        <Icon source="chevron-right" size={20} color={colors.icon} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaButton: {
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  chipText: {
    fontSize: typography.sm,
  },
  moreText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
