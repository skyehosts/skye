import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DeleteAccountForm } from "@repo/web-components/forms/delete-account-form";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Auth/DeleteAccountForm",
  component: DeleteAccountForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description:
        "Called when the user confirms deletion. Must return a promise.",
    },
  },
} satisfies Meta<typeof DeleteAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async (): Promise<void> => {
      await delay(1000);
    }),
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async (): Promise<void> => {
      await delay(1000);
      throw new Error("Failed to delete account. Please try again.");
    }),
  },
};
