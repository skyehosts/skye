import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  ChangeEmailSubscriptions,
  ChangeEmailSubscriptionsValues,
} from "@repo/web-components/email-subscriptions/change-email-subscriptions";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "User/ChangeEmailSubscriptions",
  component: ChangeEmailSubscriptions,
  tags: ["autodocs"],
  argTypes: {
    onLoad: {
      description:
        "Called on mount to load current subscription values. Must return a promise resolving to ChangeEmailSubscriptionsValues.",
    },
    onSubmit: {
      description:
        "Called with form values on submission. Must return a promise resolving to void.",
    },
  },
} satisfies Meta<typeof ChangeEmailSubscriptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLoad: fn(async (): Promise<ChangeEmailSubscriptionsValues> => {
      await delay(500);
      return { subscribedToNewsViaEmail: false };
    }),
    onSubmit: fn(
      async (_data: ChangeEmailSubscriptionsValues): Promise<void> => {
        await delay(1000);
      },
    ),
  },
};

export const PreSelected: Story = {
  args: {
    onLoad: fn(async (): Promise<ChangeEmailSubscriptionsValues> => {
      await delay(500);
      return { subscribedToNewsViaEmail: true };
    }),
    onSubmit: fn(
      async (_data: ChangeEmailSubscriptionsValues): Promise<void> => {
        await delay(1000);
      },
    ),
  },
};

export const WithLoadError: Story = {
  args: {
    onLoad: fn(async (): Promise<ChangeEmailSubscriptionsValues> => {
      await delay(500);
      throw new Error("Failed to load subscriptions");
    }),
    onSubmit: fn(async (): Promise<void> => {}),
  },
};

export const WithSubmitError: Story = {
  args: {
    onLoad: fn(async (): Promise<ChangeEmailSubscriptionsValues> => {
      await delay(500);
      return { subscribedToNewsViaEmail: true };
    }),
    onSubmit: fn(async (): Promise<void> => {
      await delay(1000);
      throw new Error("Server error: something went wrong");
    }),
  },
};
