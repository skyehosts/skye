'use client';

import { Header } from '@repo/web-components/navigation/header';
import { useAuth } from '@repo/web/use-auth';

const publicLinks = [{ label: 'Listings', href: '/' }];

const authenticatedLinks = [
  ...publicLinks,
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
    />
  );
}
