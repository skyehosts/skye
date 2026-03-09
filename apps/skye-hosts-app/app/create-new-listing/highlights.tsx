import {
  ListingHighlightId,
  LISTING_HIGHLIGHT_LABELS,
} from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, Chip } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { commonStyles, fontWeight } from "../theme";
import { useCreateListing } from "./context";

const MAX_SELECTIONS = 2;

const HIGHLIGHTS = Object.values(ListingHighlightId).map((id) => ({
  id,
  label: LISTING_HIGHLIGHT_LABELS[id],
}));

export default function HighlightsScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [selectedIds, setSelectedIds] = useState<ListingHighlightId[]>([]);

  useEffect(() => {
    if (draft.highlights) setSelectedIds(draft.highlights);
  }, [draft.highlights]);

  const typeName = draft.typeName ?? "place";

  const handleToggle = (id: ListingHighlightId) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  };

  return (
    <ScreenContainer>
      <WizardAppBar title="Make it stand out" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>
          How would you describe your {typeName}?
        </Text>
        <Text style={commonStyles.subheading}>
          Choose up to 2 highlights. We&apos;ll use these to get your
          description started.
        </Text>

        <View style={commonStyles.chipRow}>
          {HIGHLIGHTS.map(({ id, label }) => (
            <Chip
              key={id}
              selected={selectedIds.includes(id)}
              onPress={() => handleToggle(id)}
              style={[
                commonStyles.chip,
                selectedIds.includes(id) && commonStyles.chipSelected,
              ]}
              textStyle={
                selectedIds.includes(id)
                  ? [
                      commonStyles.chipTextSelected,
                      { fontWeight: fontWeight.semibold },
                    ]
                  : undefined
              }
              showSelectedCheck={false}
            >
              {label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          disabled={selectedIds.length === 0}
          onPress={() => {
            setDraftField("highlights", selectedIds);
            router.push("/create-new-listing/description");
          }}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}
