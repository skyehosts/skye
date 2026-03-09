import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { DemoComponent } from "./DemoComponent";

const meta = {
  title: "Components/DemoComponent",
  component: DemoComponent,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Card heading",
    },
    subtitle: {
      control: "text",
      description: "Secondary line below the heading",
    },
    description: {
      control: "text",
      description: "Body copy describing the glamping listing",
    },
    variant: {
      control: { type: "radio" },
      options: ["elevation", "outlined"],
      description: "MUI Card border style",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "success", "warning", "error"],
      description: "Colour applied to the action button and chip",
    },
    elevation: {
      control: { type: "range", min: 0, max: 8, step: 1 },
      description: 'Shadow depth (only applies when variant is "elevation")',
      if: { arg: "variant", eq: "elevation" },
    },
    rating: {
      control: { type: "range", min: 0, max: 5, step: 0.5 },
      description: "Star rating (0–5)",
    },
    showIcon: {
      control: "boolean",
      description: "Show the cabin avatar icon in the card header",
    },
    disabled: {
      control: "boolean",
      description:
        "Disable the action buttons and show an unavailability alert",
    },
  },
} satisfies Meta<typeof DemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Woodland Bell Tent",
    subtitle: "Nestled in ancient oaks",
    description:
      "A secluded bell tent with a private fire pit, stargazing deck, and all the comforts of home — without the walls.",
    variant: "elevation",
    color: "success",
    elevation: 3,
    rating: 4.5,
    showIcon: true,
    disabled: false,
  },
};

export const Outlined: Story = {
  args: {
    ...Default.args,
    title: "Lakeside Yurt",
    subtitle: "Wake up to water views",
    variant: "outlined",
    color: "primary",
    rating: 4,
  },
};

export const Unavailable: Story = {
  args: {
    ...Default.args,
    title: "Mountain Dome",
    subtitle: "360° panoramic views",
    color: "error",
    disabled: true,
    rating: 3.5,
  },
};

export const NoIcon: Story = {
  args: {
    ...Default.args,
    showIcon: false,
  },
};

export const BookingInteraction: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bookButton = canvas.getByRole("button", { name: /book now/i });
    await expect(bookButton).toBeEnabled();
    await userEvent.click(bookButton);
  },
};
