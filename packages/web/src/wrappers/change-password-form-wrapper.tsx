"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { ChangePasswordForm } from "@repo/web-components/forms/change-password-form";
import type { ChangePasswordFormValues } from "@repo/web-components/forms/change-password-form";
import { useAuth } from "../auth/use-auth";

export function ChangePasswordFormWrapper() {
  const { apiToken } = useAuth();

  const handleSubmit = async (
    data: ChangePasswordFormValues,
  ): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message || "Failed to change password. Please try again.",
      );
    }
  };

  return <ChangePasswordForm onSubmit={handleSubmit} />;
}
