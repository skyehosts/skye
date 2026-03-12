import type { Meta, StoryObj } from "@storybook/react";

import { HighlandPalette } from "./HighlandPalette";

const meta = {
  title: "Theme/HighlandPalette",
  component: HighlandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof HighlandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
