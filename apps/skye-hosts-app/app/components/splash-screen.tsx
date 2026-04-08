import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { colors } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoTall = require("../../assets/logo-square.png");

export function SplashScreen() {
  const { width } = useWindowDimensions();
  // Tablets are typically 768px+; use 55% width for tablets, 85% for phones
  const isTablet = width >= 768;
  const logoWidth = isTablet ? width * 0.55 : width * 0.85;

  return (
    <View style={styles.container}>
      <Image
        source={logoTall}
        style={[styles.logo, { width: logoWidth }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    aspectRatio: 1,
  },
});
