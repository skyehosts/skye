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

export function createAuth(options: CreateAuthConfigOptions): AuthResult {
  return NextAuth(createAuthConfig(options)) as unknown as AuthResult;
}

/** @internal Exported for testing only */
export function createAuthConfig(
  options: CreateAuthConfigOptions,
): NextAuthConfig {
  const { role, secret } = options;
  const apiUrl = options.apiUrl || getApiBaseUrl();

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
              apiTokenExpiry: Date.now() + 15 * 60 * 1000,
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

        // Auto-refresh if token expires within 1 minute
        if (
          token.refreshToken &&
          token.apiTokenExpiry &&
          Date.now() > token.apiTokenExpiry - 60 * 1000
        ) {
          try {
            const res = await fetch(`${apiUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
            });

            if (res.ok) {
              const data = await res.json();
              const payload = data.payload ?? data;
              token.apiToken = payload.accessToken;
              token.refreshToken = payload.refreshToken;
              token.apiTokenExpiry = Date.now() + 15 * 60 * 1000;
            } else {
              // Refresh failed — invalidate session so user is redirected to login
              token.apiToken = undefined;
              token.refreshToken = undefined;
              token.apiTokenExpiry = undefined;
              return { ...token, id: undefined as unknown as string };
            }
          } catch {
            // Network error during refresh — invalidate session
            token.apiToken = undefined;
            token.refreshToken = undefined;
            token.apiTokenExpiry = undefined;
            return { ...token, id: undefined as unknown as string };
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
