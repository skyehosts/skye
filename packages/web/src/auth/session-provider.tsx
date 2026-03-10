"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

interface AuthSessionProviderProps {
  children: ReactNode;
  session?: Session | null;
  /** How often (in seconds) the client re-validates its session against the server. */
  refetchInterval?: number;
}

export function AuthSessionProvider({
  children,
  session,
  refetchInterval = 30,
}: AuthSessionProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={refetchInterval}>
      {children}
    </SessionProvider>
  );
}
