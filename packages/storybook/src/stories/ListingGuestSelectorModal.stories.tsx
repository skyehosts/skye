import type { Meta, StoryObj } from "@storybook/react";
import { ListingGuestSelectorModal } from "@repo/web-components/listings/listing-guest-selector-modal";
import { fn } from "@storybook/test";

const meta = {
  title: "Listings/GuestSelectorModal",
  component: ListingGuestSelectorModal,
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
  },
  argTypes: {
    maxGuests: {
      control: { type: "range", min: 1, max: 20, step: 1 },
      description: "Maximum guest count (adults + children)",
    },
    childrenAllowed: {
      control: "boolean",
      description: "Whether children (ages 2-12) are allowed",
    },
    infantsAllowed: {
      control: "boolean",
      description: "Whether infants (under 2) are allowed",
    },
    petsAllowed: {
      control: "boolean",
      description: "Whether pets are allowed",
    },
  },
} satisfies Meta<typeof ListingGuestSelectorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllAllowed: Story = {
  args: {
    maxGuests: 10,
    childrenAllowed: true,
    infantsAllowed: true,
    petsAllowed: true,
  },
};

export const NoPets: Story = {
  args: {
    maxGuests: 8,
    childrenAllowed: true,
    infantsAllowed: true,
    petsAllowed: false,
  },
};

export const NoChildren: Story = {
  args: {
    maxGuests: 6,
    childrenAllowed: false,
    infantsAllowed: true,
    petsAllowed: true,
  },
};

export const Restrictive: Story = {
  args: {
    maxGuests: 2,
    childrenAllowed: false,
    infantsAllowed: false,
    petsAllowed: false,
  },
};
