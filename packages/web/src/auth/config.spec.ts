jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn((config: unknown) => config),
}));

jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: jest.fn((opts: unknown) => ({ id: "credentials", options: opts })),
}));

import { createAuthConfig } from "./config";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("createAuthConfig", () => {
  const baseOptions = { role: "guest" as const, secret: "test-secret-123" };

  beforeEach(() => {
    mockFetch.mockReset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__auth_refresh_state;
    process.env.NEXT_PUBLIC_SKYE_HOSTS_API_URL = "https://api.skyehosts.co.uk";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SKYE_HOSTS_API_URL;
  });

  describe("session configuration", () => {
    it("should use JWT strategy", () => {
      const config = createAuthConfig(baseOptions);
      expect(config.session?.strategy).toBe("jwt");
    });

    it("should set maxAge to 30 days", () => {
      const config = createAuthConfig(baseOptions);
      expect(config.session?.maxAge).toBe(30 * 24 * 60 * 60);
    });
  });

  describe("cookie configuration", () => {
    it("should include the role in the cookie name", () => {
      const guestConfig = createAuthConfig({
        role: "guest",
        secret: "secret",
      });
      expect(guestConfig.cookies?.sessionToken?.name).toBe(
        "next-auth.session-token.guest",
      );

      const hostConfig = createAuthConfig({ role: "host", secret: "secret" });
      expect(hostConfig.cookies?.sessionToken?.name).toBe(
        "next-auth.session-token.host",
      );

      const adminConfig = createAuthConfig({
        role: "admin",
        secret: "secret",
      });
      expect(adminConfig.cookies?.sessionToken?.name).toBe(
        "next-auth.session-token.admin",
      );
    });

    it("should set httpOnly and sameSite lax", () => {
      const config = createAuthConfig(baseOptions);
      const opts = config.cookies?.sessionToken?.options;
      expect(opts?.httpOnly).toBe(true);
      expect(opts?.sameSite).toBe("lax");
      expect(opts?.path).toBe("/");
    });
  });

  describe("pages", () => {
    it("should set signIn page to /login", () => {
      const config = createAuthConfig(baseOptions);
      expect(config.pages?.signIn).toBe("/login");
    });
  });

  describe("secret and trustHost", () => {
    it("should set the provided secret", () => {
      const config = createAuthConfig(baseOptions);
      expect(config.secret).toBe("test-secret-123");
    });

    it("should enable trustHost for Vercel", () => {
      const config = createAuthConfig(baseOptions);
      expect(config.trustHost).toBe(true);
    });
  });

  describe("jwt callback", () => {
    it("should populate token fields from user on sign-in", async () => {
      const config = createAuthConfig(baseOptions);
      const jwtCallback = config.callbacks?.jwt;

      const token = { sub: "some-sub" } as Record<string, unknown>;
      const user = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "guest" as const,
        apiToken: "api-token-123",
      };

      const result = await jwtCallback?.({
        token,
        user,
        account: null,
        trigger: "signIn",
      } as unknown as Parameters<NonNullable<typeof jwtCallback>>[0]);

      expect(result).toMatchObject({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "guest",
        apiToken: "api-token-123",
      });
    });

    it("should preserve existing token when user is absent", async () => {
      const config = createAuthConfig(baseOptions);
      const jwtCallback = config.callbacks?.jwt;

      const token = {
        sub: "some-sub",
        id: "user-1",
        email: "existing@example.com",
        name: "Existing",
        role: "guest",
        apiToken: "existing-token",
      } as Record<string, unknown>;

      const result = await jwtCallback?.({
        token,
        user: undefined,
        account: null,
        trigger: "update",
      } as unknown as Parameters<NonNullable<typeof jwtCallback>>[0]);

      expect(result).toMatchObject({
        id: "user-1",
        email: "existing@example.com",
        name: "Existing",
        role: "guest",
        apiToken: "existing-token",
      });
    });

    it("should handle null email and name gracefully", async () => {
      const config = createAuthConfig(baseOptions);
      const jwtCallback = config.callbacks?.jwt;

      const token = {} as Record<string, unknown>;
      const user = {
        id: "user-2",
        email: null,
        name: null,
        role: "host" as const,
      };

      const result = await jwtCallback?.({
        token,
        user,
        account: null,
        trigger: "signIn",
      } as unknown as Parameters<NonNullable<typeof jwtCallback>>[0]);

      expect(result).toMatchObject({
        id: "user-2",
        email: "",
        name: "",
        role: "host",
      });
    });
  });

  describe("session callback", () => {
    it("should populate session user and apiToken from token", async () => {
      const config = createAuthConfig(baseOptions);
      const sessionCallback = config.callbacks?.session;

      const session = {
        user: { id: "", email: "", name: "", role: "" },
        expires: new Date().toISOString(),
      };

      const token = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        apiToken: "token-xyz",
      };

      const result = (await sessionCallback?.({
        session,
        token,
      } as unknown as Parameters<
        NonNullable<typeof sessionCallback>
      >[0])) as unknown as {
        user: Record<string, unknown>;
        apiToken: string;
      };

      expect(result.user.id).toBe("user-1");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.user.role).toBe("admin");
      expect(result.apiToken).toBe("token-xyz");
    });

    it("should return empty session when token id is missing (invalidated)", async () => {
      const config = createAuthConfig(baseOptions);
      const sessionCallback = config.callbacks?.session;

      const session = {
        user: { id: "", email: "", name: "", role: "" },
        expires: new Date().toISOString(),
      };

      const token = {
        id: undefined,
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        apiToken: undefined,
      };

      const result = (await sessionCallback?.({
        session,
        token,
      } as unknown as Parameters<
        NonNullable<typeof sessionCallback>
      >[0])) as unknown as Record<string, unknown>;

      expect(result.user).toBeUndefined();
    });
  });

  describe("jwt callback – token refresh", () => {
    function getJwtCallback() {
      const config = createAuthConfig(baseOptions);
      return config.callbacks?.jwt as unknown as (args: {
        token: Record<string, unknown>;
        user: unknown;
        account: unknown;
        trigger: string;
      }) => Promise<Record<string, unknown>>;
    }

    function expiredToken() {
      return {
        id: "user-1",
        email: "test@example.com",
        name: "Test",
        role: "guest",
        apiToken: "old-token",
        refreshToken: "refresh-abc",
        apiTokenExpiry: Date.now() - 60_000, // already expired
      };
    }

    it("should refresh the access token when near expiry", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        }),
      });

      const result = await getJwtCallback()({
        token: expiredToken(),
        user: undefined,
        account: null,
        trigger: "update",
      });

      expect(result.apiToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
    });

    it("should invalidate session when refresh returns non-ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

      const result = await getJwtCallback()({
        token: expiredToken(),
        user: undefined,
        account: null,
        trigger: "update",
      });

      expect(result.apiToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.id).toBeUndefined();
    });

    it("should invalidate session when refresh throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getJwtCallback()({
        token: expiredToken(),
        user: undefined,
        account: null,
        trigger: "update",
      });

      expect(result.apiToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.id).toBeUndefined();
    });
  });

  describe("credentials provider authorize", () => {
    function getAuthorize(opts?: Parameters<typeof createAuthConfig>[0]) {
      const config = createAuthConfig(opts ?? baseOptions);
      const provider = config.providers?.[0] as unknown as {
        options: {
          authorize: (credentials: Record<string, unknown>) => unknown;
        };
      };
      return provider.options.authorize;
    }

    it("should return null when email is missing", async () => {
      const result = await getAuthorize()({ password: "pass123" });
      expect(result).toBeNull();
    });

    it("should return null when password is missing", async () => {
      const result = await getAuthorize()({ email: "test@example.com" });
      expect(result).toBeNull();
    });

    it("should return null when credentials object is empty", async () => {
      const result = await getAuthorize()({});
      expect(result).toBeNull();
    });

    it("should call the login API and return user with apiToken on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            accessToken: "jwt-token-abc",
            user: {
              id: "user-1",
              email: "host@example.com",
              name: "Host User",
              role: "host",
            },
          },
        }),
      });

      const authorize = getAuthorize({
        role: "host",
        secret: "secret",
        apiUrl: "http://localhost:3001",
      });

      const result = (await authorize({
        email: "host@example.com",
        password: "password123",
      })) as {
        id: string;
        email: string;
        name: string;
        role: string;
        apiToken: string;
      };

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "host@example.com",
            password: "password123",
          }),
        },
      );

      expect(result.id).toBe("user-1");
      expect(result.email).toBe("host@example.com");
      expect(result.name).toBe("Host User");
      expect(result.role).toBe("host");
      expect(result.apiToken).toBe("jwt-token-abc");
    });

    it("should return null when API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await getAuthorize()({
        email: "test@example.com",
        password: "wrong",
      });

      expect(result).toBeNull();
    });

    it("should return null when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getAuthorize()({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toBeNull();
    });
  });
});
