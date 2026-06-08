import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  SignUpForm,
  SignUpFormResult,
  SignUpFormValues,
} from "@repo/web-components/forms/sign-up-form";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Auth/SignUpForm",
  component: SignUpForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description:
        "Called with form values on submission. Must return a promise resolving to SignUpFormResult.",
    },
  },
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async (_data: SignUpFormValues): Promise<SignUpFormResult> => {
      await delay(1000);
      return {};
    }),
  },
};

export const WithServerError: Story = {
  args: {
    ...Default.args,
    onSubmit: fn(async (_data: SignUpFormValues): Promise<SignUpFormResult> => {
      await delay(1000);
      throw new Error("Server error: something went wrong");
    }),
  },
};

export const WithFieldValidationErrors: Story = {
  args: {
    ...Default.args,
    onSubmit: fn(async (_data: SignUpFormValues): Promise<SignUpFormResult> => {
      await delay(1000);
      throw Object.assign(new Error("Validation failed"), {
        fieldErrors: [
          {
            property: "email",
            constraints: {
              isEmail: "email must be a valid email address",
            },
          },
          {
            property: "password",
            constraints: {
              minLength: "password must be at least 8 characters",
            },
          },
        ],
      });
    }),
  },
};
