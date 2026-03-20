import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "./components/screen-container";
import StorageService, { StorageKeys } from "./services/storage";
import { SlidePager, SlidePagerHandle } from "./components/slide-pager";
import {
  borderRadius,
  colors,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "./theme";
import { APP_DISPLAY_NAME } from "@repo/common";
const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: `Welcome to ${APP_DISPLAY_NAME}`,
    imageBg: colors.driftwoodSand,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
  {
    title: "Manage Your Listings",
    imageBg: colors.warmStone,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vehicula libero vitae nunc fermentum, nec tincidunt nulla dignissim. Praesent commodo.",
  },
  {
    title: "Grow Your Business",
    imageBg: colors.seaGlassTeal,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt nisl nunc.",
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<SlidePagerHandle>(null);
  const [activePage, setActivePage] = useState(0);
  const isLast = activePage === SLIDES.length - 1;

  async function handleGetStarted() {
    await StorageService.setItem(StorageKeys.ONBOARDING_SEEN, true);
    router.replace("/");
  }

  function handleNext() {
    pagerRef.current?.setPage(activePage + 1);
  }

  return (
    <ScreenContainer style={styles.container}>
      <SlidePager ref={pagerRef} onPageChanged={setActivePage}>
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={[styles.slide, { paddingTop: insets.top + spacing.xl }]}
          >
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: slide.imageBg },
              ]}
            />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </SlidePager>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activePage ? theme.colors.primary : colors.border,
                  width: i === activePage ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {isLast ? (
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.button}
          >
            Let&apos;s get started
          </Button>
        ) : (
          <Button mode="contained" onPress={handleNext} style={styles.button}>
            Next
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl, // overridden dynamically with insets.top
  },
  imagePlaceholder: {
    width: width - spacing.lg * 2,
    height: 260,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: lineHeight.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    alignItems: "center",
    gap: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    borderRadius: borderRadius.sm,
  },
});
