import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { NextRequest, NextResponse } from "next/server";
import Credentials from "next-auth/providers/credentials";
import type { Session } from "next-auth";
import type { UserRole } from "./types";

export interface CreateAuthConfigOptions {
  apiUrl?: string;
  role: UserRole;
  secret: string;
}

/**
 * Per-role refresh state stored on globalThis so it is shared across all
 * Next.js module layers (RSC, SSR, route-handlers) that may each get their
 * own copy of the closure created by createAuthConfig().
 */
interface RefreshState {
  promise: Promise<{ accessToken: string; refreshToken: string } | null> | null;
  lastResult: {
    accessToken: string;
    refreshToken: string;
    consumedRefreshToken: string;
    timestamp: number;
  } | null;
}

const GLOBAL_KEY = "__auth_refresh_state" as const;

function getRefreshState(role: string): RefreshState {
  const store =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((globalThis as any)[GLOBAL_KEY] ??= {} as Record<string, RefreshState>);
  return (store[role] ??= { promise: null, lastResult: null });
}

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

export type AppRouteHandlerFn = (
  req: NextAuthRequest,
) =>
  | NextResponse
  | Response
  | undefined
  | undefined
  | Promise<NextResponse | Response | undefined>;

export interface AuthResult {
  handlers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GET: (...args: any[]) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    POST: (...args: any[]) => any;
  };
  auth: (() => Promise<Session | null>) &
    ((handler: AppRouteHandlerFn) => AppRouteHandlerFn);
  signIn: (
    provider?: string,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  signOut: (options?: Record<string, unknown>) => Promise<unknown>;
}

/** Extract the expiry (ms since epoch) from a JWT's `exp` claim. */
function getTokenExpiry(accessToken: string): number {
  try {
    const base64 = accessToken.split(".")[1] ?? "";
    const json = globalThis.atob(base64);
    const payload = JSON.parse(json);
    return (payload.exp as number) * 1000;
  } catch {
    // Fallback: assume 15 minutes from now if token can't be parsed
    return Date.now() + 15 * 60 * 1000;
  }
}

export function createAuth(options: CreateAuthConfigOptions): AuthResult {
  return NextAuth(createAuthConfig(options)) as unknown as AuthResult;
}

/** @internal Exported for testing only */
export function createAuthConfig(
  options: CreateAuthConfigOptions,
): NextAuthConfig {
  const { role, secret } = options;
  const apiUrl = options.apiUrl || getApiBaseUrl();

  const refreshState = getRefreshState(role);

  return {
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          try {
            const res = await fetch(`${apiUrl}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            if (!res.ok) {
              return null;
            }

            const data = await res.json();
            const user = data.payload?.user ?? data.user;

            if (!user) {
              return null;
            }

            if (user.role !== role) {
              return null;
            }

            const accessToken = data.payload?.accessToken ?? data.accessToken;
            const refreshToken =
              data.payload?.refreshToken ?? data.refreshToken;

            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
              apiToken: accessToken || undefined,
              refreshToken: refreshToken || undefined,
              apiTokenExpiry: accessToken
                ? getTokenExpiry(accessToken)
                : Date.now() + 15 * 60 * 1000,
            };
          } catch {
            return null;
          }
        },
      }),
    ],

    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    cookies: {
      sessionToken: {
        name: `next-auth.session-token.${role}`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },

    pages: {
      signIn: "/login",
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email ?? "";
          token.name = user.name ?? "";
          token.role = user.role;
          token.apiToken = user.apiToken;
          token.refreshToken = user.refreshToken;
          token.apiTokenExpiry = user.apiTokenExpiry;
        }

        const needsRefresh =
          token.refreshToken &&
          token.apiTokenExpiry &&
          Date.now() > token.apiTokenExpiry - 60 * 1000;

        // Auto-refresh if token expires within 1 minute
        if (needsRefresh) {
          // If the refresh token in this request was already consumed by a
          // previous refresh, reuse the cached result. This is critical because
          // Server Components run the JWT callback but cannot write the updated
          // cookie back, so subsequent requests arrive with the old (consumed)
          // refresh token. Without this check, the API would see refresh-token
          // reuse and revoke all sessions.
          const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes hard ceiling
          const cachedTokenExpiry = refreshState.lastResult
            ? getTokenExpiry(refreshState.lastResult.accessToken)
            : 0;
          const cachedTokenStillValid =
            cachedTokenExpiry > Date.now() + 60 * 1000;
          if (
            cachedTokenStillValid &&
            refreshState.lastResult &&
            Date.now() - refreshState.lastResult.timestamp < MAX_CACHE_AGE &&
            (token.refreshToken ===
              refreshState.lastResult.consumedRefreshToken ||
              token.refreshToken === refreshState.lastResult.refreshToken)
          ) {
            token.apiToken = refreshState.lastResult.accessToken;
            token.refreshToken = refreshState.lastResult.refreshToken;
            token.apiTokenExpiry = getTokenExpiry(
              refreshState.lastResult.accessToken,
            );
            return token;
          }

          // Deduplicate concurrent in-flight refresh calls
          const currentRefreshToken = token.refreshToken as string;
          if (!refreshState.promise) {
            refreshState.promise = fetch(`${apiUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: currentRefreshToken }),
            })
              .then(async (res) => {
                if (res.ok) {
                  const data = await res.json();
                  const payload = data.payload ?? data;
                  const result = {
                    accessToken: payload.accessToken as string,
                    refreshToken: payload.refreshToken as string,
                  };
                  // Write cache INSIDE .then() so it is visible to other
                  // callers before .finally() clears the promise reference.
                  refreshState.lastResult = {
                    ...result,
                    consumedRefreshToken: currentRefreshToken,
                    timestamp: Date.now(),
                  };
                  return result;
                }
                return null;
              })
              .catch(() => {
                return null;
              })
              .finally(() => {
                refreshState.promise = null;
              });
          }

          const result = await refreshState.promise;

          if (result) {
            token.apiToken = result.accessToken;
            token.refreshToken = result.refreshToken;
            token.apiTokenExpiry = getTokenExpiry(result.accessToken);
          } else if (
            !refreshState.lastResult ||
            getTokenExpiry(refreshState.lastResult.accessToken) <=
              Date.now() + 60 * 1000
          ) {
            token.apiToken = undefined;
            token.refreshToken = undefined;
            token.apiTokenExpiry = undefined;
            return { ...token, id: undefined as unknown as string };
          } else {
            // The promise returned null (e.g. we awaited a stale reference
            // that was already cleared), but a successful result exists in
            // the cache from another caller — use it.
            token.apiToken = refreshState.lastResult.accessToken;
            token.refreshToken = refreshState.lastResult.refreshToken;
            token.apiTokenExpiry = getTokenExpiry(
              refreshState.lastResult.accessToken,
            );
          }
        }

        return token;
      },

      async session({ session, token }) {
        if (!token.id) {
          // Token was invalidated by a failed refresh — force re-login
          return {} as typeof session;
        }
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.apiToken = token.apiToken;
        return session;
      },
    },

    secret,
    trustHost: true,
  };
}
