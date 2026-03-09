import "next-auth";
import "next-auth/jwt";
import type { UserRole } from "@repo/book-skye-api-client";

export type { UserRole };

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
    apiToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    apiToken?: string;
    refreshToken?: string;
    apiTokenExpiry?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    apiToken?: string;
    refreshToken?: string;
    apiTokenExpiry?: number;
  }
}
