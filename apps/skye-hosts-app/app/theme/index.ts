import { MD3LightTheme } from "react-native-paper";
import { colors } from "./colors";

export { colors } from "./colors";
export { spacing } from "./spacing";
export { typography } from "./typography";
export { borderRadius } from "./border-radius";
export { fontWeight } from "./font-weight";
export { lineHeight } from "./line-height";
export { commonStyles } from "./common-styles";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,
  },
};
