import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Button, Card, IconButton } from "react-native-paper";
import { ScreenContainer } from "./components/screen-container";
import {
  generateDraftId,
  setPendingDraftId,
  type CreateListingDraft,
} from "./create-new-listing/context";
import StorageService, { StorageKeys } from "./services/storage";
import { colors, commonStyles, spacing, typography } from "./theme";

const WIZARD_STEPS = [
  "about-your-place",
  "space-type",
  "location",
  "basics",
  "amenities",
  "photos",
  "title",
  "highlights",
  "description",
  "booking-settings",
  "pricing",
  "safety-details",
] as const;

function getLastCompletedStepIndex(draft: CreateListingDraft): number {
  if (draft.bookingType !== undefined) return 9; // booking-settings
  if (draft.description !== undefined) return 8; // description
  if (draft.highlights !== undefined) return 7; // highlights
  if (draft.title !== undefined) return 6; // title
  if (draft.amenities !== undefined) return 4; // amenities
  if (draft.maxGuests !== undefined) return 3; // basics
  if (draft.postCode !== undefined) return 2; // location
  if (draft.spaceType !== undefined) return 1; // space-type
  if (draft.typeId !== undefined) return 0; // about-your-place
  return -1;
}

function getDraftDisplayTitle(draft: CreateListingDraft): string {
  if (draft.typeName && draft.postCode) {
    return `${draft.typeName} in ${draft.postCode}`;
  }
  if (draft.typeName) return draft.typeName;
  return "Untitled draft";
}

function formatFriendlyDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) return `Today at ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday at ${time}`;

  return (
    date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + ` at ${time}`
  );
}

export default function EditListingsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<CreateListingDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    try {
      const drafts = await StorageService.getItem<CreateListingDraft[]>(
        StorageKeys.LISTING_DRAFTS,
      );
      setDrafts(
        (drafts ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [loadDrafts]),
  );

  const handleNewListing = () => {
    const id = generateDraftId();
    setPendingDraftId(id);
    router.push("/create-new-listing");
  };

  const handleDeleteDraft = (draft: CreateListingDraft) => {
    Alert.alert(
      "Delete draft",
      `Are you sure you want to delete "${getDraftDisplayTitle(draft)}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = drafts.filter((d) => d.id !== draft.id);
            await StorageService.setItem(StorageKeys.LISTING_DRAFTS, updated);
            setDrafts(updated);
          },
        },
      ],
    );
  };

  const handleResumeDraft = (draft: CreateListingDraft) => {
    setPendingDraftId(draft.id);

    const lastIndex = getLastCompletedStepIndex(draft);
    if (lastIndex < 0) {
      router.push("/create-new-listing/about-your-place");
      return;
    }

    const resumeIndex = Math.min(lastIndex + 1, WIZARD_STEPS.length - 1);

    for (let i = 0; i <= resumeIndex; i++) {
      router.push(`/create-new-listing/${WIZARD_STEPS[i]}`);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit listings" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            commonStyles.sectionTitle,
            { marginBottom: spacing.md, marginTop: spacing.md },
          ]}
        >
          Drafts
        </Text>
        {isLoading ? null : drafts.length === 0 ? (
          <Text style={styles.emptyText}>No drafts saved</Text>
        ) : (
          drafts.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => handleResumeDraft(d)}
              activeOpacity={0.7}
            >
              <Card style={styles.card}>
                <Card.Title
                  title={getDraftDisplayTitle(d)}
                  subtitle={formatFriendlyDate(d.updatedAt)}
                  right={() => (
                    <IconButton
                      icon="trash-can-outline"
                      iconColor={colors.danger}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(d);
                      }}
                    />
                  )}
                />
              </Card>
            </TouchableOpacity>
          ))
        )}

        <Text
          style={[
            commonStyles.sectionTitle,
            { marginBottom: spacing.md, marginTop: spacing.md },
          ]}
        >
          Create a new listing
        </Text>
        <Card style={styles.card}>
          <Card.Content style={styles.createCardContent}>
            <Text style={styles.createText}>
              Start building a new listing for your property.
            </Text>
            <Button
              mode="contained"
              style={styles.createButton}
              onPress={handleNewListing}
            >
              Get started
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  createCardContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  createText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  createButton: {
    marginTop: spacing.sm,
  },
});
