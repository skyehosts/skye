import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { colors } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoTall = require("../../assets/logo-square.png");

export function SplashScreen() {
  const { width } = useWindowDimensions();
  // Tablets are typically 768px+; use conservative widths and cap to avoid overflow
  const isTablet = width >= 768;
  const logoWidth = Math.min(isTablet ? width * 0.4 : width * 0.7, 420);

  return (
    <View style={styles.container}>
      <Image
        source={logoTall}
        style={{ width: logoWidth, height: logoWidth }}
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
});
