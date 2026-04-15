"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { ForgotPasswordForm } from "@repo/web-components/forms/forgot-password-form";
import type { ForgotPasswordFormValues } from "@repo/web-components/forms/forgot-password-form";

export function ForgotPasswordFormWrapper() {
  const handleSubmit = async (
    data: ForgotPasswordFormValues,
  ): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });

    if (!res.ok) {
      throw new Error("Forgot password request failed");
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} />;
}
