import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  DemoForm,
  DemoFormResult,
  DemoFormValues,
} from "@repo/web-components/demo/demo-form";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Demo/DemoForm",
  component: DemoForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description:
        "Called with form values on submission. Must return a promise resolving to DemoFormResult.",
    },
  },
} satisfies Meta<typeof DemoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async (_data: DemoFormValues): Promise<DemoFormResult> => {
      await delay(1000);
      return { id: "mock-id-1234", submittedAt: new Date().toISOString() };
    }),
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async (_data: DemoFormValues): Promise<DemoFormResult> => {
      await delay(1000);
      throw new Error("Server error: something went wrong");
    }),
  },
};

export const WithFieldValidationErrors: Story = {
  args: {
    onSubmit: fn(async (_data: DemoFormValues): Promise<DemoFormResult> => {
      await delay(1000);
      throw Object.assign(new Error("Validation failed"), {
        fieldErrors: [
          {
            property: "email",
            constraints: { isEmail: "email must be a valid email address" },
          },
          {
            property: "age",
            constraints: {
              min: "age must not be less than 18",
              isNumber: "age must be a number",
            },
          },
          {
            property: "website",
            constraints: { isUrl: "website must be a valid URL" },
          },
        ],
      });
    }),
  },
};
