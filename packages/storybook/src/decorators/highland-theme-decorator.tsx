import type { Decorator } from "@storybook/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createHighlandTheme } from "@repo/web/highland-theme";

const highlandTheme = createHighlandTheme({
  body: '"Open Sans", sans-serif',
  heading: '"Lora", serif',
});

export const highlandThemeDecorator: Decorator = (Story) => (
  <ThemeProvider theme={highlandTheme}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
);
