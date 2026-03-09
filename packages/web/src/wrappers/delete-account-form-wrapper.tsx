"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { DeleteAccountForm } from "@repo/web-components/forms/delete-account-form";
import { useAuth } from "../auth/use-auth";

export function DeleteAccountFormWrapper() {
  const { apiToken, signOut } = useAuth();

  const handleSubmit = async (): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/user`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message || "Failed to delete account. Please try again.",
      );
    }

    await signOut({ redirectTo: "/" });
  };

  return <DeleteAccountForm onSubmit={handleSubmit} />;
}
