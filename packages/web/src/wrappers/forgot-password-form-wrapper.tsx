"use client";

import { getApiBaseUrl } from "@repo/skye-hosts-api-client";
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
      throw new Error("Something went wrong. Please try again.");
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} />;
}
