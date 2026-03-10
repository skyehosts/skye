"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { LoginForm } from "@repo/web-components/forms/login-form";
import type { LoginFormValues } from "@repo/web-components/forms/login-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "../auth/types";

const ROLE_LABELS: Record<UserRole, string> = {
  guest: "guest",
  host: "host",
  admin: "administrator",
};

export interface LoginFormWrapperProps {
  role: UserRole;
  defaultRedirect?: string;
}

export function LoginFormWrapper({
  role,
  defaultRedirect = "/dashboard",
}: LoginFormWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const handleSubmit = async (data: LoginFormValues): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!res.ok) {
      throw new Error("Invalid email or password");
    }

    const responseData = await res.json();
    const user = responseData.payload?.user ?? responseData.user;

    if (user?.role && user.role !== role) {
      throw new Error(
        `This account is registered as a ${ROLE_LABELS[user.role as UserRole] || user.role} and does not have access to this site.`,
      );
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Invalid email or password");
    }

    const callbackUrl = searchParams.get("callbackUrl") || defaultRedirect;
    router.push(callbackUrl);
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      infoMessage={
        registered
          ? "Your account has been created. Please log in to continue."
          : undefined
      }
    />
  );
}
