import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  ForgotPasswordForm,
  ForgotPasswordFormValues,
} from "@repo/web-components/forms/forgot-password-form";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Auth/ForgotPasswordForm",
  component: ForgotPasswordForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description:
        "Called with form values on submission. Must return a promise.",
    },
  },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async (_data: ForgotPasswordFormValues): Promise<void> => {
      await delay(1000);
    }),
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async (_data: ForgotPasswordFormValues): Promise<void> => {
      await delay(1000);
      throw new Error("Server error: something went wrong");
    }),
  },
};
