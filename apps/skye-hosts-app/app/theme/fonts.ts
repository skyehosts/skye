import { configureFonts } from "react-native-paper";

/** Font family constants matching the names registered by @expo-google-fonts */
export const fontFamily = {
  // Heading font (Lora - serif)
  heading: "Lora_700Bold",
  headingSemibold: "Lora_600SemiBold",
  headingRegular: "Lora_400Regular",

  // Body font (Open Sans - sans-serif)
  body: "OpenSans_400Regular",
  bodyMedium: "OpenSans_500Medium",
  bodySemibold: "OpenSans_600SemiBold",
  bodyBold: "OpenSans_700Bold",
} as const;

export const paperFonts = configureFonts({
  config: {
    displayLarge: { fontFamily: fontFamily.heading },
    displayMedium: { fontFamily: fontFamily.heading },
    displaySmall: { fontFamily: fontFamily.heading },

    headlineLarge: { fontFamily: fontFamily.heading },
    headlineMedium: { fontFamily: fontFamily.headingSemibold },
    headlineSmall: { fontFamily: fontFamily.headingSemibold },

    titleLarge: { fontFamily: fontFamily.headingSemibold },
    titleMedium: { fontFamily: fontFamily.headingSemibold },
    titleSmall: { fontFamily: fontFamily.bodySemibold },

    bodyLarge: { fontFamily: fontFamily.body },
    bodyMedium: { fontFamily: fontFamily.body },
    bodySmall: { fontFamily: fontFamily.body, fontSize: 14 },

    labelLarge: { fontFamily: fontFamily.headingSemibold },
    labelMedium: { fontFamily: fontFamily.headingSemibold },
    labelSmall: { fontFamily: fontFamily.headingSemibold },

    default: { fontFamily: fontFamily.body },
  },
});
