import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Header } from "@repo/web-components/navigation/header";

const meta = {
  title: "Navigation/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    isAuthenticated: {
      control: "boolean",
      description: "Whether the user is currently logged in.",
    },
    isLoading: {
      control: "boolean",
      description: "Whether the auth state is still loading.",
    },
    onLogout: {
      description: "Called when the user clicks the log out button.",
    },
    logoHref: {
      control: "text",
      description: "URL the logo links to.",
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    isAuthenticated: false,
    onLogout: fn(),
    links: [
      { label: "Listings", href: "/listings" },
      { label: "About", href: "/about" },
    ],
  },
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    onLogout: fn(),
    links: [
      { label: "Listings", href: "/listings" },
      { label: "About", href: "/about" },
    ],
  },
};

export const Loading: Story = {
  args: {
    isAuthenticated: false,
    isLoading: true,
    onLogout: fn(),
    links: [
      { label: "Listings", href: "/listings" },
      { label: "About", href: "/about" },
    ],
  },
};

export const NoExtraLinks: Story = {
  args: {
    isAuthenticated: false,
    onLogout: fn(),
  },
};
