import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@repo/skye-hosts-api-client": path.resolve(
        __dirname,
        "../../skye-hosts-api-client/src/index.ts",
      ),
      "@repo/common": path.resolve(__dirname, "../../common/src/index.ts"),
      "@repo/theme": path.resolve(__dirname, "../../theme/src/index.ts"),
      "@repo/web/create-app-theme": path.resolve(
        __dirname,
        "../../web/src/theme/create-app-theme.ts",
      ),
      "@repo/web/highland-theme": path.resolve(
        __dirname,
        "../../web/src/theme/highland-theme.ts",
      ),
    };
    return config;
  },
};

export default config;
