import type { Meta, StoryObj } from "@storybook/react";

import { HighlandAlerts } from "./HighlandAlerts";

const meta = {
  title: "Theme/HighlandAlerts",
  component: HighlandAlerts,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof HighlandAlerts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
