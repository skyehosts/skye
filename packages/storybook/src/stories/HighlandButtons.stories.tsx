import type { Meta, StoryObj } from "@storybook/react";

import { HighlandButtons } from "./HighlandButtons";

const meta = {
  title: "Theme/HighlandButtons",
  component: HighlandButtons,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof HighlandButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
