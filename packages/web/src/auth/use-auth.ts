"use client";

import { useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const res = await fetch(input, init);
      if (res.status === 401 || res.status === 498) {
        // Token may have expired — trigger a session refresh via NextAuth
        // and retry once with the new token before signing out.
        const refreshedSession = await update();
        if (refreshedSession?.apiToken) {
          const retryInit = {
            ...init,
            headers: {
              ...init?.headers,
              Authorization: `Bearer ${refreshedSession.apiToken}`,
            },
          };
          const retryRes = await fetch(input, retryInit);
          if (retryRes.status !== 401 && retryRes.status !== 498) {
            return retryRes;
          }
        }
        await signOut({ redirectTo: "/login" });
      }
      return res;
    },
    [update],
  );

  // The server may return an empty session ({}) when a token refresh fails.
  // Guard against status being "authenticated" with no actual user data.
  const isAuthenticated = status === "authenticated" && !!session?.user?.id;

  return {
    session,
    user: session?.user,
    apiToken: session?.apiToken,
    isAuthenticated,
    isLoading: status === "loading",
    signIn,
    signOut,
    authFetch,
  };
}
