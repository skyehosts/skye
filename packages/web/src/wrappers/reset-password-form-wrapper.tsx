"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { ResetPasswordForm } from "@repo/web-components/forms/reset-password-form";
import type { ResetPasswordFormValues } from "@repo/web-components/forms/reset-password-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (data: ResetPasswordFormValues): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message || "Invalid or expired reset token. Please try again.",
      );
    }

    const json = await res.json();
    const user = json.payload?.user ?? json.user;

    if (user?.email) {
      const result = await signIn("credentials", {
        email: user.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
        return;
      }
    }

    router.push("/login");
  };

  return <ResetPasswordForm onSubmit={handleSubmit} tokenMissing={!token} />;
}
