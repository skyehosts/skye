import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { spacing } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoSquare = require("../../assets/logo-square.png");

export function AuthLogo() {
  const { width } = useWindowDimensions();
  const logoWidth = width >= 768 ? width * 0.4 : width * 0.65;

  return (
    <Image
      source={logoSquare}
      style={[styles.logo, { width: logoWidth, height: logoWidth }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
});
