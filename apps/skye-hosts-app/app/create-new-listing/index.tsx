import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Icon } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import {
  colors,
  commonStyles,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "../theme";
import { APP_DISPLAY_NAME } from "@repo/common";

const STEPS = [
  {
    number: 1,
    title: "Tell us about your place",
    description:
      "Share some basic info, such as where it is and how many guests can stay.",
    icon: "home-outline",
  },
  {
    number: 2,
    title: "Make it stand out",
    description:
      "Add 5 or more photos plus a title and description \u2014 we\u2019ll help you out.",
    icon: "image-multiple-outline",
  },
  {
    number: 3,
    title: "Finish up and publish",
    description:
      "Choose a starting price, verify a few details then publish your listing.",
    icon: "check-decagram-outline",
  },
];

export default function CreateListingIntroScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <WizardAppBar title="New listing" />

      <View style={commonStyles.content}>
        <Text style={styles.heading}>
          It&apos;s easy to get started on {APP_DISPLAY_NAME}
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step) => (
            <Card key={step.number} style={styles.card}>
              <View style={styles.cardInner}>
                <Text style={styles.stepNumber}>{step.number}</Text>
                <View style={styles.textContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <Icon
                    source={step.icon}
                    size={40}
                    color={colors.iconDecorative}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => router.push("/create-new-listing/about-your-place")}
          contentStyle={styles.buttonContent}
        >
          Get started
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {},
  heading: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  steps: {
    gap: spacing.md,
  },
  card: {
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  stepNumber: {
    fontSize: typography.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    width: 24,
    textAlign: "center",
  },
  textContent: {
    flex: 1,
    gap: spacing.xs,
  },
  stepTitle: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  stepDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});
