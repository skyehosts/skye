import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  ChangePasswordForm,
  ChangePasswordFormValues,
} from "@repo/web-components/forms/change-password-form";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Auth/ChangePasswordForm",
  component: ChangePasswordForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description:
        "Called with form values on submission. Must return a promise.",
    },
  },
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async (_data: ChangePasswordFormValues): Promise<void> => {
      await delay(1000);
    }),
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async (_data: ChangePasswordFormValues): Promise<void> => {
      await delay(1000);
      throw new Error("Current password is incorrect");
    }),
  },
};
