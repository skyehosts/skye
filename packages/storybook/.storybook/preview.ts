import type { Preview } from "@storybook/react";
import { highlandThemeDecorator } from "../src/decorators/highland-theme-decorator";

const preview: Preview = {
  decorators: [highlandThemeDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default preview;
