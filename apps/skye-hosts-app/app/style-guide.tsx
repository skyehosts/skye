import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Icon,
  IconButton,
  Text,
} from "react-native-paper";
import { InfoBox } from "./components/info-box";
import { NumberStepper } from "./components/number-stepper";
import { ScreenContainer } from "./components/screen-container";
import { colors, commonStyles, fontWeight, spacing, typography } from "./theme";

export default function StyleGuideScreen() {
  const router = useRouter();
  const [stepperValue, setStepperValue] = useState(2);
  const [cardSelected, setCardSelected] = useState(false);
  const [chipSelected, setChipSelected] = useState(false);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Style Guide" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Buttons ──────────────────────────────────── */}
        <Text style={commonStyles.sectionTitle}>Buttons</Text>
        <View style={styles.guideRow}>
          <Button mode="contained" onPress={() => {}}>
            Contained
          </Button>
          <Text style={styles.guideLabel}>Primary CTA (Save, Next)</Text>
        </View>
        <View style={styles.guideRow}>
          <Button mode="outlined" onPress={() => {}}>
            Outlined
          </Button>
          <Text style={styles.guideLabel}>
            Secondary action (Locate, Import)
          </Text>
        </View>
        <View style={styles.guideRow}>
          <Button mode="text" onPress={() => {}}>
            Text
          </Button>
          <Text style={styles.guideLabel}>Tertiary / dismiss (Cancel)</Text>
        </View>
        <View style={styles.guideRow}>
          <Button mode="text" textColor={colors.danger} onPress={() => {}}>
            Delete
          </Button>
          <Text style={styles.guideLabel}>Danger action (Delete, Remove)</Text>
        </View>

        {/* ── Icons ────────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Icons</Text>
        <View style={styles.guideRow}>
          <Icon source="chevron-right" size={24} color={colors.icon} />
          <Text style={styles.guideLabel}>
            Interactive — colors.icon (deepSkyeBlue)
          </Text>
        </View>
        <View style={styles.guideRow}>
          <Icon
            source="weather-sunny"
            size={24}
            color={colors.iconDecorative}
          />
          <Text style={styles.guideLabel}>
            Decorative — colors.iconDecorative (seaGlassTeal)
          </Text>
        </View>
        <View style={styles.guideRow}>
          <Ionicons name="close" size={22} color={colors.iconMuted} />
          <Text style={styles.guideLabel}>
            Dismiss — colors.iconMuted (grey600)
          </Text>
        </View>
        <View style={styles.guideRow}>
          <Icon
            source="information-outline"
            size={24}
            color={colors.heatherPurple}
          />
          <Text style={styles.guideLabel}>Info — colors.heatherPurple</Text>
        </View>
        <View style={styles.guideRow}>
          <Icon source="alert-outline" size={24} color={colors.warning} />
          <Text style={styles.guideLabel}>Warning — colors.warning</Text>
        </View>
        <View style={styles.guideRow}>
          <Icon source="alert-circle-outline" size={24} color={colors.danger} />
          <Text style={styles.guideLabel}>Danger — colors.danger</Text>
        </View>

        {/* ── Cards ────────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Cards</Text>
        <View style={styles.guideCardsRow}>
          <View
            style={[
              commonStyles.card,
              styles.guideCard,
              cardSelected && commonStyles.cardSelected,
            ]}
          >
            <Icon
              source="home-outline"
              size={32}
              color={cardSelected ? colors.primary : colors.iconDecorative}
            />
            <Text
              style={[
                commonStyles.cardTitle,
                cardSelected && commonStyles.cardTitleSelected,
              ]}
            >
              {cardSelected ? "Selected" : "Unselected"}
            </Text>
          </View>
          <Button
            mode="text"
            onPress={() => setCardSelected((v) => !v)}
            compact
          >
            Toggle
          </Button>
        </View>
        <Text style={styles.guideLabel}>
          Unselected: grey border + white bg. Selected: primary border +
          primaryLight bg.
        </Text>

        {/* ── Chips ────────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Chips</Text>
        <View style={commonStyles.chipRow}>
          <Chip
            style={[
              commonStyles.chip,
              chipSelected && commonStyles.chipSelected,
            ]}
            textStyle={chipSelected ? commonStyles.chipTextSelected : undefined}
            showSelectedCheck={false}
            onPress={() => setChipSelected((v) => !v)}
          >
            {chipSelected ? "Selected" : "Unselected"}
          </Chip>
          <Chip style={commonStyles.chip} showSelectedCheck={false}>
            Default
          </Chip>
        </View>
        <Text style={styles.guideLabel}>
          Unselected: grey border + white bg. Selected: primary bg + white text.
        </Text>

        {/* ── Links ────────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Links</Text>
        <Text style={styles.guideLink}>Edit details</Text>
        <Text style={styles.guideLabel}>
          colors.primary + underline. Used for inline text actions.
        </Text>

        {/* ── Info Boxes ───────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Info Boxes</Text>
        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Info</Text>
          <InfoBox variant="info">Informational callout message.</InfoBox>
        </View>
        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Warning</Text>
          <InfoBox variant="warning">Warning requiring attention.</InfoBox>
        </View>
        <View style={styles.section}>
          <Text style={commonStyles.itemTitle}>Error</Text>
          <InfoBox variant="error">Error state notification.</InfoBox>
        </View>

        {/* ── Stepper ──────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Stepper</Text>
        <NumberStepper
          label="Guests"
          value={stepperValue}
          onChange={setStepperValue}
          min={1}
          max={20}
        />
        <Text style={styles.guideLabel}>
          Outlined + iconColor/borderColor = colors.primary. Used for counters.
        </Text>

        {/* ── Icon Buttons ─────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={commonStyles.sectionTitle}>Icon Buttons</Text>
        <View style={styles.guideRow}>
          <IconButton
            icon="minus"
            mode="outlined"
            size={18}
            iconColor={colors.primary}
            style={{ borderColor: colors.primary }}
            onPress={() => {}}
          />
          <IconButton
            icon="plus"
            mode="outlined"
            size={18}
            iconColor={colors.primary}
            style={{ borderColor: colors.primary }}
            onPress={() => {}}
          />
          <Text style={styles.guideLabel}>
            Outlined stepper — secondary interactive control
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  guideLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  guideCardsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  guideCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  guideLink: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    textDecorationLine: "underline",
  },
});
