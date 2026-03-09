"use client";

import { useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const res = await fetch(input, init);
      if (res.status === 401 || res.status === 498) {
        await signOut({ redirectTo: "/login" });
      }
      return res;
    },
    [],
  );

  return {
    session,
    user: session?.user,
    apiToken: session?.apiToken,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn,
    signOut,
    authFetch,
  };
}
