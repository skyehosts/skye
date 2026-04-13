import { MD3LightTheme } from "react-native-paper";
import { colors } from "./colors";
import { paperFonts } from "./fonts";

export { colors } from "./colors";
export { spacing } from "./spacing";
export { typography } from "./typography";
export { borderRadius } from "./border-radius";
export { fontWeight } from "./font-weight";
export { lineHeight } from "./line-height";
export { commonStyles } from "./common-styles";
export { fontFamily } from "./fonts";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,
    secondaryContainer: colors.primaryLight,
    onSecondaryContainer: colors.primary,
    outline: colors.border,
  },
  fonts: paperFonts,
};
