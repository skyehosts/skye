'use client';

import { APP_DISPLAY_NAME } from '@repo/common';
import { Header } from '@repo/web-components/navigation/header';
import { useAuth } from '@repo/web/use-auth';

const publicLinks = [{ label: 'Listings', href: '/' }];

const authenticatedLinks = [
  ...publicLinks,
  { label: 'Favourites', href: '/favourites' },
  { label: 'Messages', href: '/messages' },
];

export function HeaderWrapper() {
  const { isAuthenticated, isLoading, signOut } = useAuth();

  return (
    <Header
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      onLogout={() => signOut({ redirectTo: '/login' })}
      links={isAuthenticated ? authenticatedLinks : publicLinks}
      logoSquareSrc="/logo-square.png"
      logoAlt={APP_DISPLAY_NAME}
      displayName={APP_DISPLAY_NAME}
    />
  );
}
