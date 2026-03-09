import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { NumberStepper } from "../components/number-stepper";
import { ScreenContainer } from "../components/screen-container";
import { commonStyles } from "../theme";
import { useCreateListing } from "./context";

interface Counter {
  label: string;
  key: "guests" | "bedrooms" | "beds" | "bathrooms";
  min: number;
}

const COUNTERS: Counter[] = [
  { label: "Guests", key: "guests", min: 1 },
  { label: "Bedrooms", key: "bedrooms", min: 0 },
  { label: "Beds", key: "beds", min: 1 },
  { label: "Bathrooms", key: "bathrooms", min: 1 },
];

type Counts = Record<Counter["key"], number>;

export default function BasicsScreen() {
  const router = useRouter();
  const { draft, setDraftField } = useCreateListing();
  const [counts, setCounts] = useState<Counts>({
    guests: 1,
    bedrooms: 0,
    beds: 1,
    bathrooms: 1,
  });

  useEffect(() => {
    if (draft.maxGuests !== undefined) {
      setCounts({
        guests: draft.maxGuests,
        bedrooms: draft.bedrooms ?? 0,
        beds: draft.beds ?? 1,
        bathrooms: draft.bathrooms ?? 1,
      });
    }
  }, [draft.maxGuests, draft.bedrooms, draft.beds, draft.bathrooms]);

  return (
    <ScreenContainer>
      <WizardAppBar title="Tell us about your place" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>
          Share some basics about your place
        </Text>
        <Text style={commonStyles.subheading}>
          You&apos;ll add more details later, such as bed types.
        </Text>

        <View style={commonStyles.borderedRows}>
          {COUNTERS.map((counter, index) => (
            <View key={counter.key}>
              {index > 0 && <View style={commonStyles.borderedRowDivider} />}
              <View style={commonStyles.borderedRow}>
                <NumberStepper
                  label={counter.label}
                  value={counts[counter.key]}
                  onChange={(value) =>
                    setCounts((prev) => ({
                      ...prev,
                      [counter.key]: value,
                    }))
                  }
                  min={counter.min}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            setDraftField("maxGuests", counts.guests);
            setDraftField("bedrooms", counts.bedrooms);
            setDraftField("beds", counts.beds);
            setDraftField("bathrooms", counts.bathrooms);
            router.push("/create-new-listing/amenities");
          }}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}
